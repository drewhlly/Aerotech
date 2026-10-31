import {NextResponse} from "next/server";

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
// Keep old clients on the same category validation and transaction path.
export {POST} from '@/app/api/leave/route';
