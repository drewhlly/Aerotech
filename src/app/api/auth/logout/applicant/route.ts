import {createHash} from "node:crypto";
import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {APPLICANT_COOKIE,applicantDB} from "@/lib/applicant-session";
export const runtime="nodejs";
export async function POST(){
 const jar=await cookies();const token=jar.get(APPLICANT_COOKIE)?.value;
 if(token && process.env.DATABASE_URL){const pool=applicantDB();try{await pool.query("DELETE FROM applicant_sessions WHERE token_hash=$1",[createHash("sha256").update(token).digest("hex")]);}catch{return NextResponse.json({error:"Unable to end session"},{status:503});}finally{await pool.end();}}
 jar.delete('aerotech_portal_role');jar.delete(APPLICANT_COOKIE);return NextResponse.json({ok:true});
}