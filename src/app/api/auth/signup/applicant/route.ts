import { NextResponse } from "next/server";
import { randomUUID, randomBytes, scrypt as rawScrypt } from "node:crypto";
import { promisify } from "node:util";
import { applicantDB, startApplicantSession } from "@/lib/applicant-session";
export const runtime="nodejs";
const scrypt=promisify(rawScrypt);
export async function POST(request: Request) {
 let body: Record<string, unknown>;
 try { const input: unknown=await request.json(); if (!input || Array.isArray(input) || typeof input!=="object") throw Error(); body=input as Record<string,unknown>; }
 catch { return NextResponse.json({error:"Invalid registration details."},{status:400}); }
 const fields=["firstName","lastName","email","phone","password"];
 if(fields.some(key=>typeof body[key]!=="string" || !(body[key] as string).trim() || (body[key] as string).length>255)) return NextResponse.json({error:"Complete every field."},{status:400});
 const email=(body.email as string).trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || (body.password as string).length<12) return NextResponse.json({error:"Use a valid email and a password of at least 12 characters."},{status:400});
 if(!process.env.DATABASE_URL) return NextResponse.json({error:"Registration is temporarily unavailable."},{status:503});
 const salt=randomBytes(16).toString("hex");
 const hash=(await scrypt(body.password as string,salt,64) as Buffer).toString("hex");
 const pool=applicantDB();
 try {
  const result=await pool.query("INSERT INTO applicant_accounts(id,first_name,last_name,email,phone,password_hash) VALUES($1,$2,$3,$4,$5,$6) RETURNING id",[randomUUID(),(body.firstName as string).trim(),(body.lastName as string).trim(),email,(body.phone as string).trim(),`scrypt:${salt}:${hash}`]);
  await startApplicantSession(pool,result.rows[0].id);
  return NextResponse.json({ok:true},{status:201});
 } catch(err:unknown) {
  if(err && typeof err==="object" && "code" in err && err.code==="23505") return NextResponse.json({error:"This email is already registered. Please sign in."},{status:409});
  return NextResponse.json({error:"Registration could not be completed."},{status:500});
 } finally {await pool.end();}
}
