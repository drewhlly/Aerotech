import {NextResponse} from "next/server";
import {currentEmployee} from "@/lib/employee-auth";
import {db} from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(){
 const employee=await currentEmployee();if(!employee)return NextResponse.json({error:"Employee sign-in required"},{status:401});
 const pool=db();try{
  const r=await pool.query("SELECT p.id,p.payroll_month,p.status,p.gross_total,p.deduction_total,p.net_total,a.stage FROM payroll_runs p JOIN payroll_stage_approvers a ON a.employer_id=p.employer_id AND a.employee_id=$2 WHERE p.employer_id=$1 AND p.status='awaiting_'||a.stage ORDER BY p.created_at DESC LIMIT 40",[employee.employer_id,employee.id]);
  return NextResponse.json({awaitingReview:r.rows});
 }catch{return NextResponse.json({error:"Payroll reviews unavailable"},{status:503});}finally{await pool.end();}
}
// Use the canonical three-stage workflow, including reviewer separation and notifications.
export {POST} from '@/app/api/payroll/approve/route';
