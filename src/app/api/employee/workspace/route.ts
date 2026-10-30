import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {currentEmployee} from "@/lib/employee-auth";
import {db} from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(){
 const e=await currentEmployee();if(!e)return NextResponse.json({error:"Unauthorized"},{status:401});
 const pool=db();try{
 const [requests,shifts]=await Promise.all([
 pool.query("SELECT id,request_type,details,start_date,end_date,status,created_at,review_note FROM employee_requests WHERE employer_id=$1 AND employee_id=$2 ORDER BY created_at DESC LIMIT 40",[e.employer_id,e.id]),
 pool.query("SELECT id,work_date,starts_at,ends_at FROM workforce_shifts WHERE employer_id=$1 AND employee_id=$2 AND work_date>=(NOW() AT TIME ZONE 'Africa/Lagos')::date ORDER BY work_date LIMIT 40",[e.employer_id,e.id])]);
 return NextResponse.json({employee:{firstName:e.first_name,lastName:e.last_name,email:e.email,department:e.department},requests:requests.rows,shifts:shifts.rows});
 }catch{return NextResponse.json({error:"Employee records unavailable"},{status:503});}finally{await pool.end();}
}
export async function POST(request:Request){
 const e=await currentEmployee();if(!e)return NextResponse.json({error:"Unauthorized"},{status:401});
 let body:{type?:unknown;startDate?:unknown;endDate?:unknown;details?:unknown};
 try{body=await request.json();}catch{return NextResponse.json({error:"Invalid request"},{status:400});}
 if(body.type!=="leave"||typeof body.startDate!=="string"||typeof body.endDate!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(body.startDate)||!/^\d{4}-\d{2}-\d{2}$/.test(body.endDate)||body.endDate<body.startDate||typeof body.details!=="string"||!body.details.trim()||body.details.length>2000)return NextResponse.json({error:"Provide valid leave dates and reason"},{status:400});
 if(!e.manager_employee_id)return NextResponse.json({error:"Your department does not have an assigned line manager. Contact HR."},{status:422});
 const pool=db();try{const r=await pool.query("INSERT INTO employee_requests(id,employer_id,employee_id,request_type,start_date,end_date,details) VALUES($1,$2,$3,'leave',$4::date,$5::date,$6) RETURNING id",[randomUUID(),e.employer_id,e.id,body.startDate,body.endDate,body.details.trim()]);return NextResponse.json({id:r.rows[0].id,status:"pending"},{status:201});}catch{return NextResponse.json({error:"Unable to submit leave request"},{status:503});}finally{await pool.end();}
}
