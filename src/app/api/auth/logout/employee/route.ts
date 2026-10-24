import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/employer-session";
import { EMPLOYEE_COOKIE, digest } from "@/lib/employee-auth";
export async function POST() {
 const jar = await cookies();
 const token = jar.get(EMPLOYEE_COOKIE)?.value;
 if (token) {
   const pool = db();
   try { await pool.query("DELETE FROM employee_sessions WHERE token_hash = $1", [digest(token)]); }
   finally { await pool.end(); }
 }
 jar.delete(EMPLOYEE_COOKIE);
 return NextResponse.json({ok:true});
}