import { NextResponse } from "next/server";
import { scrypt as rawScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { applicantDB, startApplicantSession } from "@/lib/applicant-session";
export const runtime="nodejs";
const scrypt=promisify(rawScrypt);
export async function POST(request:Request) {
 let body:{email?:unknown,password?:unknown};
 try {body=await request.json();}catch{return NextResponse.json({error:"Invalid request."},{status:400});}
 if(typeof body?.email!=="string"||typeof body?.password!=="string")return NextResponse.json({error:"Email and password required."},{status:400});
 if(!process.env.DATABASE_URL)return NextResponse.json({error:"Sign in unavailable."},{status:503});
 const pool=applicantDB();
 try {
  const result=await pool.query("SELECT id,password_hash FROM applicant_accounts WHERE email=$1",[body.email.trim().toLowerCase()]);
  const account=result.rows[0];
  if(!account)return NextResponse.json({error:"Incorrect email or password."},{status:401});
  const [,salt,hex]=String(account.password_hash).split(":");
  if(!salt||!hex)return NextResponse.json({error:"Incorrect email or password."},{status:401});
  const expected=Buffer.from(hex,"hex");if(expected.length!==64)return NextResponse.json({error:"Incorrect email or password."},{status:401});
  const actual=await scrypt(body.password,salt,expected.length) as Buffer;
  if(!timingSafeEqual(expected,actual))return NextResponse.json({error:"Incorrect email or password."},{status:401});
  await startApplicantSession(pool,account.id);
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:"Unable to sign in."},{status:503});}
 finally{await pool.end();}
}
