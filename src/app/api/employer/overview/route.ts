import {NextResponse} from "next/server";
import {currentEmployer,db} from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(){
 const employer=await currentEmployer();
 if(!employer)return NextResponse.json({error:"Sign in required"},{status:401});
 const pool=db();
 try{
  const [people,requests,payroll,hire]=await Promise.all([
   pool.query("SELECT COUNT(*)::int AS total,COUNT(*) FILTER(WHERE employment_status='active')::int AS active FROM workforce_employees WHERE employer_id=$1",[employer]),
   pool.query("SELECT COUNT(*)::int AS pending FROM employee_requests WHERE employer_id=$1 AND status='pending'",[employer]),
   pool.query("SELECT payroll_month,status,gross_total,net_total FROM payroll_runs WHERE employer_id=$1 ORDER BY payroll_month DESC,created_at DESC LIMIT 1",[employer]),
   pool.query("SELECT COUNT(*)::int AS hires FROM workforce_employees WHERE employer_id=$1 AND hire_date >= date_trunc('month',CURRENT_DATE)",[employer])
  ]);
  return NextResponse.json({employees:people.rows[0],pendingRequests:requests.rows[0].pending,newHires:hire.rows[0].hires,payroll:payroll.rows[0]||null,source:"live"});
 }catch{return NextResponse.json({error:"Live dashboard metrics unavailable"},{status:503})}finally{await pool.end();}
}
