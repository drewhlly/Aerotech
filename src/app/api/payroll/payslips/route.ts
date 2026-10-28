import {NextResponse} from "next/server";
import {currentEmployer,db} from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(request:Request){
 const employer=await currentEmployer();
 if(!employer)return NextResponse.json({error:"Employer sign-in required"},{status:401});
 const month=new URL(request.url).searchParams.get("month");
 if(month&&!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))return NextResponse.json({error:"Month must be YYYY-MM"},{status:400});
 const pool=db();
 try{
  const r=await pool.query(`SELECT r.id AS run_id,r.payroll_month,r.status,p.id AS payroll_employee_id,p.full_name,i.gross,i.pension,i.paye,i.nhf,i.sanctions,i.other_deductions,i.net FROM payroll_runs r JOIN payroll_run_items i ON i.run_id=r.id JOIN payroll_employees p ON p.id=i.employee_id AND p.employer_id=r.employer_id WHERE r.employer_id=$1 AND ($2::date IS NULL OR r.payroll_month=$2::date) ORDER BY r.payroll_month DESC,p.full_name LIMIT 500`,[employer,month?month+"-01":null]);
  return NextResponse.json({payslips:r.rows,notice:"Draft and awaiting-approval figures are previews, not issued payslips. Payment execution is unavailable."});
 }catch{return NextResponse.json({error:"Payroll records unavailable"},{status:503});}finally{await pool.end();}
}
