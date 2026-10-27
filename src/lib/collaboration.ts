import { currentEmployer, db } from "./employer-session";
import { currentEmployee } from "./employee-auth";
import { mayWrite, uuid, type ProjectRole } from "./collaboration-policy";
import { NextResponse } from "next/server";
import type { PoolClient } from "pg";
export type Actor = {
  tenant: string;
  id: string;
  employee: string | null;
  department: string | null;
  role: "employer" | "employee";
};
export class AccessError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.status = status;
  }
}
export async function actor(): Promise<Actor> {
  const e = await currentEmployee();
  if (e)
    return {
      tenant: e.employer_id,
      id: "employee:" + e.id,
      employee: e.id,
      department: e.department,
      role: "employee",
    };
  const c = await currentEmployer();
  if (c)
    return {
      tenant: c,
      id: "employer:" + c,
      employee: null,
      department: null,
      role: "employer",
    };
  throw new AccessError("Sign in with an active company account", 401);
}
export async function transaction<T>(fn: (c: PoolClient) => Promise<T>) {
  const p = db();
  const c = await p.connect();
  try {
    await c.query("BEGIN");
    const result = await fn(c);
    await c.query("COMMIT");
    return result;
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
    await p.end();
  }
}
export function errorResponse(e: unknown) {
  if (e instanceof AccessError)
    return NextResponse.json({ error: e.message }, { status: e.status });
  if (e instanceof SyntaxError)
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  console.error(
    "Collaboration request failed",
    e instanceof Error ? e.message : "unknown",
  );
  return NextResponse.json(
    { error: "This operation could not be completed" },
    { status: 503 },
  );
}
export const respond = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
export function text(v: unknown, max = 200, required = false) {
  if (v === undefined || v === null) {
    if (required) throw new AccessError("A required field is missing", 400);
    return "";
  }
  if (typeof v !== "string" || v.length > max || (required && !v.trim()))
    throw new AccessError("Invalid text field", 400);
  return v.trim();
}
export function id(v: unknown) {
  if (!uuid(v)) throw new AccessError("Invalid identifier", 400);
  return v;
}
export function date(v: unknown) {
  if (!v) return null;
  const d = new Date(String(v));
  if (!Number.isFinite(d.getTime())) throw new AccessError("Invalid date", 400);
  return d.toISOString();
}
export function ids(v: unknown, max = 1000) {
  if (!Array.isArray(v) || v.length > max || v.some((x) => !uuid(x)))
    throw new AccessError("Invalid identifiers", 400);
  return [...new Set(v)] as string[];
}
export async function projectAccess(
  c: PoolClient,
  a: Actor,
  project: string,
  write = false,
  structural = false,
) {
  id(project);
  const r = await c.query(
    `SELECT p.*,CASE WHEN $3::uuid IS NULL THEN 'Owner' ELSE m.role END AS access_role FROM projects p LEFT JOIN project_members m ON m.project_id=p.id AND m.employee_id=$3 WHERE p.employer_id=$1 AND p.id=$2 AND ($3::uuid IS NULL OR m.employee_id IS NOT NULL) FOR UPDATE OF p`,
    [a.tenant, project, a.employee],
  );
  const p = r.rows[0];
  if (!p) throw new AccessError("Project not found", 404);
  if (write && !mayWrite(p.access_role as ProjectRole, structural))
    throw new AccessError("Your project role does not allow this change");
  return p;
}
export async function audit(
  c: PoolClient,
  a: Actor,
  action: string,
  resource: string,
  details: object = {},
) {
  await c.query(
    "INSERT INTO collaboration_audit(employer_id,actor,action,resource_id,details) VALUES($1,$2,$3,$4,$5)",
    [a.tenant, a.id, action, resource, JSON.stringify(details)],
  );
}
export async function enqueue(
  c: PoolClient,
  tenant: string,
  kind: string,
  key: string,
  payload: object,
  runAt: Date = new Date(),
) {
  await c.query(
    "INSERT INTO collaboration_jobs(employer_id,kind,dedupe_key,payload,run_at) VALUES($1,$2,$3,$4,$5) ON CONFLICT(employer_id,dedupe_key) DO NOTHING",
    [tenant, kind, key, JSON.stringify(payload), runAt],
  );
}
export async function notify(
  c: PoolClient,
  a: Actor,
  recipients: string[],
  event: string,
  title: string,
  body: string,
  path: string,
  key: string,
) {
  const rows = [...new Set(recipients)].map((recipient) => ({
    recipient,
    event,
    title,
    body,
    href:
      (recipient.startsWith("employee:")
        ? "/employee"
        : "/dashboard/employer") + path,
    key: event + ":" + key + ":" + recipient,
  }));
  if (!rows.length) return;
  await c.query(
    `INSERT INTO collaboration_jobs(employer_id,kind,dedupe_key,payload) SELECT $1,'notification',x->>'key',x FROM jsonb_array_elements($2::jsonb) x ON CONFLICT DO NOTHING`,
    [a.tenant, JSON.stringify(rows)],
  );
}
export async function documentAccess(
  c: PoolClient,
  a: Actor,
  document: string,
  write = false,
) {
  id(document);
  const r = await c.query(
    `SELECT d.* FROM library_documents d WHERE d.employer_id=$1 AND d.id=$2 AND ($3::uuid IS NULL OR d.owner=$4 OR d.visibility='company' OR d.visibility='department' AND d.department=$5 OR EXISTS(SELECT 1 FROM document_grants g WHERE g.document_id=d.id AND g.employee_id=$3)) FOR UPDATE OF d`,
    [a.tenant, document, a.employee, a.id, a.department],
  );
  if (!r.rows[0]) throw new AccessError("Document not found", 404);
  if (write && a.employee)
    throw new AccessError("Employer document management required");
  return r.rows[0];
}
