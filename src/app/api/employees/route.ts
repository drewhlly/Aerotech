import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { currentEmployer, db } from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(){
 const employerId=await currentEmployer();
 if(!employerId)return NextResponse.json({error:"Sign in required"},{status:401});
 const pool=db();try{
  const r=await pool.query("SELECT id,employee_number,first_name,last_name,email,phone,job_title,department,location,employment_status,hire_date,date_of_birth,manager_employee_id,department_id FROM workforce_employees WHERE employer_id=$1 ORDER BY created_at DESC",[employerId]);
  return NextResponse.json({employees:r.rows});
 }catch{return NextResponse.json({error:"Employee database unavailable"},{status:503});}finally{await pool.end();}
}
export async function POST(request:Request){
 const employerId=await currentEmployer();
 if(!employerId)return NextResponse.json({error:"Sign in required"},{status:401});
 let b:Record<string,unknown>;
 try{b=await request.json();}catch{return NextResponse.json({error:"Invalid data"},{status:400});}
 for(const field of ["firstName","lastName","email","jobTitle","department"])if(typeof b[field]!=="string"||!(b[field] as string).trim()||(b[field] as string).length>255)return NextResponse.json({error:`Invalid ${field}`},{status:400});
 const email=(b.email as string).trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return NextResponse.json({error:"Invalid email"},{status:400});
 if(b.dateOfBirth != null && b.dateOfBirth !== "" && (typeof b.dateOfBirth!=="string" || !/^\d{4}-\d{2}-\d{2}$/.test(b.dateOfBirth) || Number.isNaN(Date.parse(b.dateOfBirth)) || b.dateOfBirth > new Date().toISOString().slice(0,10)))return NextResponse.json({error:"Invalid date of birth"},{status:400});
 const pool=db();try {
  const r=await pool.query("INSERT INTO workforce_employees(id,employer_id,first_name,last_name,email,phone,job_title,department,location,employment_status,date_of_birth,hire_date) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'active',$10::date,CURRENT_DATE) RETURNING id",[randomUUID(),employerId,(b.firstName as string).trim(),(b.lastName as string).trim(),email,String(b.phone||""), (b.jobTitle as string).trim(),(b.department as string).trim(),String(b.location||""),b.dateOfBirth||null]);
  return NextResponse.json({id:r.rows[0].id},{status:201});
 }catch(e:unknown){if(e&&typeof e==="object"&&"code" in e&&e.code==="23505")return NextResponse.json({error:"Employee email already exists"},{status:409});return NextResponse.json({error:"Unable to save employee"},{status:503});}finally{await pool.end();}
}
