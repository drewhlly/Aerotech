import type { PoolClient } from "pg";
import { createHmac, createHash } from "node:crypto";
import { enqueue } from "./collaboration";
const digest = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export function activationDeliveryConfigured() {
  return !!(
    process.env.RESEND_API_KEY &&
    process.env.INVITATION_FROM_EMAIL &&
    process.env.APP_BASE_URL?.startsWith("https://") &&
    Buffer.from(process.env.DOCUMENT_ENCRYPTION_KEY || "", "base64").length ===
      32
  );
}
export async function queueEmployeeActivation(
  c: PoolClient,
  employer: string,
  employee: string,
  source: string,
) {
  const r = await c.query(
    "SELECT e.id,e.email FROM workforce_employees e WHERE e.id=$1 AND e.employer_id=$2 AND e.employment_status IN ('active','probation','on_leave') FOR UPDATE",
    [employee, employer],
  );
  if (!r.rowCount) return null;
  if (
    (
      await c.query(
        "SELECT 1 FROM employee_credentials WHERE employee_id=$1 AND employer_id=$2",
        [employee, employer],
      )
    ).rowCount
  )
    return null;
  await c.query("UPDATE collaboration_jobs SET status='dead',lease_until=NULL,last_error='Invitation delivery window expired' WHERE employer_id=$1 AND kind='employee_activation' AND payload->>'employee'=$2 AND created_at<NOW()-INTERVAL '23 hours' AND (status='pending' OR status='running' AND lease_until<NOW())",[employer,employee]);
  const pending = await c.query(
    "SELECT id FROM collaboration_jobs WHERE employer_id=$1 AND kind='employee_activation' AND payload->>'employee'=$2 AND (status IN ('pending','running') OR status='done' AND created_at>NOW()-INTERVAL '24 hours') ORDER BY created_at DESC LIMIT 1",
    [employer, employee],
  );
  if (pending.rowCount) return pending.rows[0].id as string;
  await enqueue(c, employer, "employee_activation", "activation:" + source, {
    employee,
    email: r.rows[0].email,
  });
  return (
    await c.query(
      "SELECT id FROM collaboration_jobs WHERE employer_id=$1 AND dedupe_key=$2",
      [employer, "activation:" + source],
    )
  ).rows[0]?.id as string | null;
}
export async function deliverEmployeeActivation(
  c: PoolClient,
  job: {
    id: string;
    employer_id: string;
    created_at: Date | string;
    payload: Record<string, unknown>;
  },
) {
  const e = (
    await c.query(
      "SELECT e.id,e.first_name,e.email FROM workforce_employees e WHERE e.id::text=$1 AND e.employer_id=$2 AND e.employment_status IN ('active','probation','on_leave') FOR UPDATE",
      [String(job.payload.employee), job.employer_id],
    )
  ).rows[0];
  if (
    !e ||
    (
      await c.query(
        "SELECT 1 FROM employee_credentials WHERE employee_id=$1 AND employer_id=$2",
        [e.id, job.employer_id],
      )
    ).rowCount
  )
    return;
  if (!activationDeliveryConfigured())
    throw Error("Employee invitation delivery is not configured");
  if (e.email !== job.payload.email)
    throw Error("Employee email changed; issue a new invitation");
  const created = new Date(job.created_at),
    age = Date.now() - created.getTime();
  // Provider idempotency lasts 24 hours; do not retry ambiguous sends beyond that window.
  if (!Number.isFinite(age) || age > 23 * 3600000)
    throw Error("Invitation delivery window expired; issue a new invitation");
  const token = createHmac(
    "sha256",
    Buffer.from(process.env.DOCUMENT_ENCRYPTION_KEY!, "base64"),
  )
    .update(
      "employee-activation:" +
        job.employer_id +
        ":" +
        e.id +
        ":" +
        job.id +
        ":" +
        e.email,
    )
    .digest("hex");
  const expires = new Date(created.getTime() + 48 * 3600000);
  await c.query(
    "INSERT INTO employee_invitations(id,employer_id,employee_id,token_hash,expires_at) VALUES($1,$2,$3,$4,$5) ON CONFLICT(id) DO NOTHING",
    [job.id, job.employer_id, e.id, digest(token), expires],
  );
  const invitation = (
    await c.query(
      "SELECT token_hash,accepted_at FROM employee_invitations WHERE id=$1 AND employer_id=$2 AND employee_id=$3",
      [job.id, job.employer_id, e.id],
    )
  ).rows[0];
  if (invitation?.accepted_at) return;
  if (invitation?.token_hash !== digest(token))
    throw Error("Invitation key changed; issue a new invitation");
  const link = new URL("/auth/activate", process.env.APP_BASE_URL!);
  link.hash = "token=" + token;
  const { sendEmployeeInvitation } = await import("./invitation-email");
  await sendEmployeeInvitation(e.email, e.first_name, link.toString(), job.id);
}
