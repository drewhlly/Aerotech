import {enrollWorkflows} from '@/lib/workflow-automation';
import { NextResponse } from "next/server";
import {createEmployee} from "@/lib/employee-create";
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
export async function POST(request:Request){const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Sign in required"},{status:401});let b;try{b=await request.json();if(!b||typeof b!=="object"||Array.isArray(b))throw Error()}catch{return NextResponse.json({error:"Invalid data"},{status:400})}const pool=db(),c=await pool.connect();try{await c.query('BEGIN');const id=await createEmployee(c,employer,b);await enrollWorkflows(c,employer);await c.query('COMMIT');return NextResponse.json({id},{status:201})}catch(e){await c.query('ROLLBACK');return NextResponse.json({error:(e as {code?:string}).code==='23505'?'Employee email already exists':e instanceof Error?e.message:'Unable to save employee'},{status:400})}finally{c.release();await pool.end()}}
