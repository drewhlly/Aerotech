import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {currentEmployee} from "@/lib/employee-auth";
import {db} from "@/lib/employer-session";
export const runtime="nodejs";
const stages=["hr","finance","management","ceo"] as const;
export async function GET(){
 const employee=await currentEmployee();if(!employee)return NextResponse.json({error:"Employee sign-in required"},{status:401});
 const pool=db();try{
  const r=await pool.query("SELECT p.id,p.payroll_month,p.status,p.gross_total,p.deduction_total,p.net_total,a.stage FROM payroll_runs p JOIN payroll_stage_approvers a ON a.employer_id=p.employer_id AND a.employee_id=$2 WHERE p.employer_id=$1 AND p.status='awaiting_'||a.stage ORDER BY p.created_at DESC LIMIT 40",[employee.employer_id,employee.id]);
  return NextResponse.json({awaitingReview:r.rows});
 }catch{return NextResponse.json({error:"Payroll reviews unavailable"},{status:503});}finally{await pool.end();}
}
export async function POST(request:Request){
 const employee=await currentEmployee();if(!employee)return NextResponse.json({error:"Employee sign-in required"},{status:401});
 let b:{runId?:unknown;decision?:unknown;note?:unknown};
 try{b=await request.json();}catch{return NextResponse.json({error:"Invalid request"},{status:400});}
 if(typeof b.runId!=="string"||!["approved","rejected"].includes(String(b.decision))||typeof b.note!=="string"||b.note.length>1000)return NextResponse.json({error:"Run, decision and review note required"},{status:400});
 const pool=db(),client=await pool.connect();
 try{
  await client.query("BEGIN");
  const r=await client.query("SELECT p.id,p.status,a.stage FROM payroll_runs p JOIN payroll_stage_approvers a ON a.employer_id=p.employer_id AND a.employee_id=$3 WHERE p.id=$1 AND p.employer_id=$2 FOR UPDATE OF p",[b.runId,employee.employer_id,employee.id]);
  const run=r.rows[0];
  if(!run||run.status!=="awaiting_"+run.stage){await client.query("ROLLBACK");return NextResponse.json({error:"Not authorised for the current payroll approval stage"},{status:403});}
  const index=stages.indexOf(run.stage as typeof stages[number]);if(index<0)throw Error("Invalid stage");
  const previous=await client.query("SELECT stage,decision FROM payroll_stage_reviews WHERE run_id=$1",[b.runId]);
  if(previous.rows.length!==index||previous.rows.some((x:{stage:string;decision:string})=>x.decision!=="approved"||stages.indexOf(x.stage as typeof stages[number])>=index)){await client.query("ROLLBACK");return NextResponse.json({error:"Previous approval stages incomplete"},{status:409});}
  const next=b.decision==="rejected"?"rejected":index===3?"approved":"awaiting_"+stages[index+1];
  await client.query("INSERT INTO payroll_stage_reviews(id,employer_id,run_id,stage,reviewer_employee_id,decision,note) VALUES($1,$2,$3,$4,$5,$6,$7)",[randomUUID(),employee.employer_id,b.runId,run.stage,employee.id,b.decision,b.note]);
  await client.query("UPDATE payroll_runs SET status=$1,approved_at=CASE WHEN $1='approved' THEN NOW() ELSE NULL END WHERE id=$2 AND employer_id=$3",[next,b.runId,employee.employer_id]);
  await client.query("COMMIT");return NextResponse.json({status:next,reviewedStage:run.stage});
 }catch{await client.query("ROLLBACK").catch(()=>{});return NextResponse.json({error:"Approval was not saved"},{status:503});}finally{client.release();await pool.end();}
}
