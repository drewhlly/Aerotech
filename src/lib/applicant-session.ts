import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { Pool } from "pg";
export const APPLICANT_COOKIE = "aerotech_applicant_session";
const digest = (token: string) => createHash("sha256").update(token).digest("hex");
export function applicantDB() {
 if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
 return new Pool({ connectionString: process.env.DATABASE_URL, max: 2, connectionTimeoutMillis: 5000 });
}
export async function startApplicantSession(pool: Pool, applicantId: string) {
 (await cookies()).delete("aerotech_employer_session");
 (await cookies()).delete("aerotech_employee_session");

 const token = randomBytes(32).toString("hex");
 await pool.query("INSERT INTO applicant_sessions(token_hash,applicant_id,expires_at) VALUES($1,$2,NOW()+INTERVAL '7 days')",[digest(token),applicantId]);
 (await cookies()).set(APPLICANT_COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:604800});
}
export async function currentApplicant() {
 const token = (await cookies()).get(APPLICANT_COOKIE)?.value;
 if (!token || !process.env.DATABASE_URL) return null;
 const pool = applicantDB();
 try { const result=await pool.query("SELECT applicant_id FROM applicant_sessions WHERE token_hash=$1 AND expires_at>NOW()",[digest(token)]); return (result.rows[0]?.applicant_id as string | undefined) ?? null; }
 finally { await pool.end(); }
}
