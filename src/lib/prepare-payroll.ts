import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {db} from "@/lib/employer-session";
import {calculatePayrollForCountry,payrollJurisdiction} from "@/lib/country-payroll";
export async function preparePayroll(employerId:string,month:string) {
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))return NextResponse.json({error:"Use YYYY-MM"},{status:400});
 if(month<"2026-01")return NextResponse.json({error:"These calculation rules apply to payroll from January 2026"},{status:400});
 const pool=db();const client=await pool.connect();
 try {
  await client.query("BEGIN");
  const employer=await client.query("SELECT country FROM employer_accounts WHERE id=$1",[employerId]);
  const country=String(employer.rows[0]?.country||"").trim();
  const countryCode: Record<string,string>={nigeria:"NG",ng:"NG",ghana:"GH",gh:"GH",kenya:"KE",ke:"KE","united states":"US",us:"US",usa:"US","united kingdom":"GB",uk:"GB",gb:"GB"};
  const jurisdiction=countryCode[country.toLowerCase()]||country.toUpperCase();
  if(!payrollJurisdiction(jurisdiction).ready){await client.query("ROLLBACK");return NextResponse.json({error:`Payroll cannot run for ${country}: verified local statutory rules must be configured first.`},{status:422});}
  const missing=await client.query("SELECT COUNT(*)::int AS count FROM workforce_employees w WHERE w.employer_id=$1 AND w.employment_status IN ('active','probation','on_leave') AND NOT EXISTS(SELECT 1 FROM payroll_employees p WHERE p.employer_id=w.employer_id AND (p.workforce_employee_id=w.id OR (p.workforce_employee_id IS NULL AND LOWER(p.email)=LOWER(w.email))))",[employerId]);
  if(missing.rows[0].count){await client.query("ROLLBACK");return NextResponse.json({error:`${missing.rows[0].count} employee(s) need compensation setup. Enter their salaries before preparing payroll.`,code:"PAYROLL_SETUP_REQUIRED",setupUrl:"/dashboard/employer/payroll/setup"},{status:422});}
  const employees=await client.query("SELECT p.* FROM payroll_employees p LEFT JOIN workforce_employees w ON w.employer_id=p.employer_id AND (w.id=p.workforce_employee_id OR (p.workforce_employee_id IS NULL AND LOWER(w.email)=LOWER(p.email))) WHERE p.employer_id=$1 AND p.active=TRUE AND (w.id IS NULL OR w.employment_status IN ('active','probation','on_leave'))",[employerId]);
  if(!employees.rows.length){await client.query("ROLLBACK");return NextResponse.json({error:"No employees are included in payroll. Open Payroll setup to enter compensation or review inclusion settings.",code:"PAYROLL_SETUP_REQUIRED",setupUrl:"/dashboard/employer/payroll/setup"},{status:422});}
  const sanctions=await client.query("SELECT employee_id,COALESCE(SUM(amount_ngn),0) AS amount FROM payroll_sanctions WHERE employer_id=$1 AND payroll_month=$2 AND status='approved' GROUP BY employee_id",[employerId,month+"-01"]);
  const sanctionMap=new Map<string,number>(sanctions.rows.map((s:{employee_id:string;amount:string})=>[s.employee_id,Number(s.amount)]));
  const items=employees.rows.map(e=>{
   const result=calculatePayrollForCountry(jurisdiction,{
    monthlyGross:Number(e.monthly_gross_ngn),basic:Number(e.basic_salary_ngn??0),housing:Number(e.housing_allowance_ngn??0),transport:Number(e.transport_allowance_ngn??0),
    annualRentRelief:Number(e.annual_rent_relief_ngn??0),pensionEnabled:e.pension_enabled!==false,nhfEnabled:e.nhf_enabled===true,
    taxExempt:e.tax_exempt===true,sanctions:sanctionMap.get(e.id)||0,otherDeductions:Number(e.other_deductions_ngn||0)
   });
   return {id:e.id,...result};
  });
  const sums=items.reduce((a,e)=>({gross:a.gross+e.gross,deductions:a.deductions+e.deductions,net:a.net+e.net,paye:a.paye+e.paye,employerPension:a.employerPension+e.employerPension}),{gross:0,deductions:0,net:0,paye:0,employerPension:0});
  const runId=randomUUID();
  await client.query("INSERT INTO payroll_runs(id,employer_id,payroll_month,status,gross_total,deduction_total,net_total) VALUES($1,$2,$3,'awaiting_hr',$4,$5,$6)",[runId,employerId,month+"-01",sums.gross.toFixed(2),sums.deductions.toFixed(2),sums.net.toFixed(2)]);
  for(const e of items)await client.query("INSERT INTO payroll_run_items(id,run_id,employee_id,gross,pension,other_deductions,net,paye,nhf,sanctions,employer_pension) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",[randomUUID(),runId,e.id,e.gross,e.employeePension,e.otherDeductions,e.net,e.paye,e.nhf,e.sanctions,e.employerPension]);
  await client.query("COMMIT");
  return NextResponse.json({runId,status:"awaiting_hr",...sums},{status:201});
 }catch(e){await client.query("ROLLBACK");return NextResponse.json({error:e instanceof Error?e.message:"Payroll preparation failed"},{status:409});}
 finally{client.release();await pool.end();}
}

