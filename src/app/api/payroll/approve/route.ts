import {syncPayslipNotifications} from '@/lib/payslip-notifications';
import {randomUUID} from "node:crypto";
import {NextResponse} from "next/server";
import {currentEmployee} from "@/lib/employee-auth";
import {db} from "@/lib/employer-session";
export const runtime="nodejs";
const stages=["hr","finance","ceo"] as const;
export async function POST(request:Request){
 const origin=request.headers.get("origin");
 if(!origin||new URL(origin).host!==new URL(request.url).host)return NextResponse.json({error:"Invalid origin"},{status:403});
 const employee=await currentEmployee();
 if(!employee)return NextResponse.json({error:"Employee sign-in required"},{status:401});
 let body:{runId?:string;decision?:string;note?:string};
 try{body=await request.json();}catch{return NextResponse.json({error:"Invalid request"},{status:400});}
 if(!body.runId||!["approved","rejected"].includes(body.decision||""))return NextResponse.json({error:"Run and decision required"},{status:400});
 if(body.decision==="rejected"&&!body.note?.trim())return NextResponse.json({error:"Rejection reason required"},{status:400});
 const pool=db();const client=await pool.connect();
 try{
  await client.query("BEGIN");
  const run=await client.query("SELECT status FROM payroll_runs WHERE id=$1 AND employer_id=$2 FOR UPDATE",[body.runId,employee.employer_id]);
  if(!run.rowCount){await client.query("ROLLBACK");return NextResponse.json({error:"Payroll run not found"},{status:404});}
  const index=stages.findIndex(stage=>run.rows[0].status==="awaiting_"+stage);
  if(index<0){await client.query("ROLLBACK");return NextResponse.json({error:"Run not awaiting review"},{status:409});}
  const stage=stages[index];
  const assigned=await client.query("SELECT 1 FROM payroll_stage_approvers WHERE employer_id=$1 AND stage=$2 AND employee_id=$3",[employee.employer_id,stage,employee.id]);
  if(!assigned.rowCount){await client.query("ROLLBACK");return NextResponse.json({error:"Not assigned to this approval stage"},{status:403});}
  const prior=await client.query("SELECT stage,decision,reviewer_employee_id FROM payroll_stage_reviews WHERE run_id=$1 AND employer_id=$2",[body.runId,employee.employer_id]);
  if(prior.rows.some(row=>row.reviewer_employee_id===employee.id)||stages.slice(0,index).some(s=>!prior.rows.some(row=>row.stage===s&&row.decision==="approved"))){await client.query("ROLLBACK");return NextResponse.json({error:"Previous approvals incomplete or reviewer already participated"},{status:409});}
  await client.query("INSERT INTO payroll_stage_reviews(id,employer_id,run_id,stage,reviewer_employee_id,decision,note) VALUES($1,$2,$3,$4,$5,$6,$7)",[randomUUID(),employee.employer_id,body.runId,stage,employee.id,body.decision,body.note?.trim().slice(0,1000)||null]);
  const status=body.decision==="rejected"?"rejected":index===2?"approved":"awaiting_"+stages[index+1];
  await client.query("UPDATE payroll_runs SET status=$1,approved_at=CASE WHEN $1='approved' THEN NOW() ELSE approved_at END WHERE id=$2 AND employer_id=$3",[status,body.runId,employee.employer_id]);
  if(status==='approved')await syncPayslipNotifications(client,employee.employer_id);
  await client.query("COMMIT");
  return NextResponse.json({stage,status,transferInitiated:false});
 }catch{await client.query("ROLLBACK");return NextResponse.json({error:"Approval failed"},{status:409});}
 finally{client.release();await pool.end();}
}
