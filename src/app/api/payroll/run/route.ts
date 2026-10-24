import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { currentEmployer, db } from "@/lib/employer-session";
export const runtime="nodejs";
export async function POST(request: Request) {
 const employerId=await currentEmployer();
 if(!employerId)return NextResponse.json({error:"Sign in required"},{status:401});
 let month:string;
 try {const b=await request.json();month=String(b.month);} catch{return NextResponse.json({error:"Month required"},{status:400});}
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))return NextResponse.json({error:"Use YYYY-MM"},{status:400});
 const pool=db();const client=await pool.connect();
 try {
  await client.query("BEGIN");
  const employees=await client.query("SELECT id,monthly_gross_ngn,employee_pension_rate,other_deductions_ngn FROM payroll_employees WHERE employer_id=$1 AND active=TRUE",[employerId]);
  if(!employees.rows.length){await client.query("ROLLBACK");return NextResponse.json({error:"No active employees on payroll"},{status:422});}
  const items=employees.rows.map((e:{id:string;monthly_gross_ngn:string;employee_pension_rate:string;other_deductions_ngn:string})=>{
   const gross=Math.round(Number(e.monthly_gross_ngn)*100);
   const pension=Math.round(gross*Number(e.employee_pension_rate));
   const other=Math.round(Number(e.other_deductions_ngn)*100);
   if(!Number.isSafeInteger(gross)||!Number.isSafeInteger(pension)||!Number.isSafeInteger(other)||gross<0||pension<0||other<0||pension+other>gross)throw Error("Invalid employee compensation");
   return {id:e.id,gross,pension,other,net:gross-pension-other};
  });
  const totals=items.reduce((a,e)=>({gross:a.gross+e.gross,deductions:a.deductions+e.pension+e.other,net:a.net+e.net}),{gross:0,deductions:0,net:0});
  const runId=randomUUID();
  await client.query("INSERT INTO payroll_runs(id,employer_id,payroll_month,status,gross_total,deduction_total,net_total) VALUES($1,$2,$3,'awaiting_hr',$4,$5,$6)",[runId,employerId,month+"-01",totals.gross/100,totals.deductions/100,totals.net/100]);
  for(const e of items)await client.query("INSERT INTO payroll_run_items(id,run_id,employee_id,gross,pension,other_deductions,net) VALUES($1,$2,$3,$4,$5,$6,$7)",[randomUUID(),runId,e.id,e.gross/100,e.pension/100,e.other/100,e.net/100]);
  await client.query("COMMIT");
  return NextResponse.json({runId,status:"awaiting_hr",...Object.fromEntries(Object.entries(totals).map(([k,v])=>[k,v/100]))},{status:201});
 }catch(e){await client.query("ROLLBACK");return NextResponse.json({error:"Unable to prepare payroll; check employee data and duplicate months."},{status:409});}
 finally{client.release();await pool.end();}
}
