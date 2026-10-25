import { randomBytes, createHash } from "node:crypto";
import { Pool } from "pg";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "aerotech_employer_session";
export const sessionDigest = (token: string) => createHash("sha256").update(token).digest("hex");
export const db = () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  return new Pool({ connectionString: process.env.DATABASE_URL, max: 2, connectionTimeoutMillis: 5000 });
};
export async function startEmployerSession(pool: Pool, employerId: string) {
  const token = randomBytes(32).toString("hex");
  await pool.query("INSERT INTO employer_sessions(token_hash, employer_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')", [sessionDigest(token), employerId]);
  const jar = await cookies();
 (await cookies()).delete("aerotech_employee_session");
 (await cookies()).delete("aerotech_applicant_session");

  jar.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 7 * 24 * 60 * 60 });
}
export async function currentEmployer() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const pool = db();
  try {
    const result = await pool.query("SELECT employer_id FROM employer_sessions WHERE token_hash = $1 AND expires_at > NOW()", [sessionDigest(token)]);
    return (result.rows[0]?.employer_id as string | undefined) ?? null;
  } finally { await pool.end(); }
}
