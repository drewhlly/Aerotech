import {planAllows} from './plan-access';
import {selectPortal} from './portal-selection';
import { randomBytes, createHash } from "node:crypto";
import { Pool,types } from "pg";
// PostgreSQL DATE is a calendar day, not a midnight instant in the server timezone.
types.setTypeParser(1082,value=>value);
import { cookies,headers } from "next/headers";

export const SESSION_COOKIE = "aerotech_employer_session";
export const sessionDigest = (token: string) => createHash("sha256").update(token).digest("hex");
export const db = () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  return new Pool({ connectionString: process.env.DATABASE_URL, max: 2, connectionTimeoutMillis: 5000 });
};
export async function startEmployerSession(pool: Pool, employerId: string) {
 await selectPortal('employer');
  const token = randomBytes(32).toString("hex");
  await pool.query("INSERT INTO employer_sessions(token_hash, employer_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')", [sessionDigest(token), employerId]);
  const jar = await cookies();
 (await cookies()).delete("aerotech_employee_session");
 (await cookies()).delete("aerotech_applicant_session");

  jar.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 7 * 24 * 60 * 60 });
}
export async function currentEmployer(requireService=true) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const pool = db();
  try {
    const result = await pool.query("SELECT s.employer_id,a.subscription_required,sub.plan,sub.status,sub.paid_until FROM employer_sessions s JOIN employer_accounts a ON a.id=s.employer_id LEFT JOIN company_subscriptions sub ON sub.employer_id=a.id WHERE s.token_hash = $1 AND s.expires_at > NOW()", [sessionDigest(token)]);
    const row=result.rows[0];if(!row)return null;if(requireService&&row.subscription_required){if(row.status!=='active'||!row.paid_until||new Date(row.paid_until)<=new Date())return null;const path=(await headers()).get('x-aerotech-service-path')||'';if(!planAllows(row.plan,path))return null}return row.employer_id as string;
  } finally { await pool.end(); }
}
