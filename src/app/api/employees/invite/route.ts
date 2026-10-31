import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { currentEmployer, db } from "@/lib/employer-session";
import {
  queueEmployeeActivation,
  activationDeliveryConfigured,
} from "@/lib/activation-delivery";
import { uuid } from "@/lib/collaboration-policy";
export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store" };
export async function GET(request: Request) {
  const employer = await currentEmployer();
  if (!employer)
    return NextResponse.json(
      { error: "Employer sign in required." },
      { status: 401, headers },
    );
  const id = new URL(request.url).searchParams.get("employeeId");
  if (!uuid(id))
    return NextResponse.json(
      { error: "Choose an employee." },
      { status: 400, headers },
    );
  const pool = db();
  try {
    const e = await pool.query(
      "SELECT e.id,e.employment_status,EXISTS(SELECT 1 FROM employee_credentials c WHERE c.employee_id=e.id AND c.employer_id=e.employer_id) AS activated FROM workforce_employees e WHERE e.id=$1 AND e.employer_id=$2",
      [id, employer],
    );
    if (!e.rowCount)
      return NextResponse.json(
        { error: "Employee not found." },
        { status: 404, headers },
      );
    const j = await pool.query(
      "SELECT status,attempts,created_at,last_error FROM collaboration_jobs WHERE employer_id=$1 AND kind='employee_activation' AND payload->>'employee'=$2 ORDER BY created_at DESC LIMIT 1",
      [employer, id],
    );
    return NextResponse.json(
      {
        activated: e.rows[0].activated,
        eligible:['active','probation','on_leave'].includes(e.rows[0].employment_status),
        delivery: j.rows[0] || null,
        configured: activationDeliveryConfigured(),
      },
      { headers },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to load delivery status." },
      { status: 503, headers },
    );
  } finally {
    await pool.end();
  }
}
export async function POST(request: Request) {
  const employer = await currentEmployer();
  if (!employer)
    return NextResponse.json(
      { error: "Employer sign in required." },
      { status: 401, headers },
    );
  const b = await request.json().catch(() => null);
  if (!b || typeof b !== "object" || Array.isArray(b) || !uuid(b.employeeId))
    return NextResponse.json(
      { error: "Choose an employee." },
      { status: 400, headers },
    );
  const pool = db(),
    c = await pool.connect();
  try {
    await c.query("BEGIN");
    const e = await c.query(
      "SELECT id,email FROM workforce_employees WHERE employer_id=$1 AND id=$2 AND employment_status IN ('active','probation','on_leave') FOR UPDATE",
      [employer, b.employeeId],
    );
    if (!e.rowCount)
      return NextResponse.json(
        { error: "Active employee not found." },
        { status: 404, headers },
      );
    if (
      (
        await c.query(
          "SELECT 1 FROM employee_credentials WHERE employer_id=$1 AND employee_id=$2",
          [employer, b.employeeId],
        )
      ).rowCount
    )
      return NextResponse.json(
        { error: "Employee already activated." },
        { status: 409, headers },
      );
    const job = await queueEmployeeActivation(
      c,
      employer,
      b.employeeId,
      "manual:" + randomUUID(),
    );
    await c.query("COMMIT");
    return NextResponse.json(
      {
        queued: true,
        jobId: job,
        employeeEmail: e.rows[0].email,
        configured: activationDeliveryConfigured(),
      },
      { status: 202, headers },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to queue invitation." },
      { status: 503, headers },
    );
  } finally {
    await c.query("ROLLBACK").catch(() => {});
    c.release();
    await pool.end();
  }
}
