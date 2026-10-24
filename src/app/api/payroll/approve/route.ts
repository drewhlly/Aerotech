import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { currentEmployer, db } from "@/lib/employer-session";
export const runtime="nodejs";
const order=["hr","finance","management","ceo"] as const;
export async function POST(request:Request) {
 const employerId=await currentEmployer();
 if(!employerId)return NextResponse.json({error:"Sign in required"},{status:401});
 let data:{runId?:string;decision?:string;note?:string};
 try {data=await request.json();}catch{return NextResponse.json({error:"Invalid request"},{status:400});}
 if(!data.runId || !["approved","rejected"].includes(data.decision||""))return NextResponse.json({error:"Run and decision required"},{status:400});
 const pool=db(); const client=await pool.connect();
 try {
  await client.query("BEGIN");
  const rows=await client.query("SELECT id,status FROM payroll_runs WHERE id=$1 AND employer_id=$2 FOR UPDATE",[data.runId,employerId]);
  const run=rows.rows[0];
  if(!run || !String(run.status).startsWith("awaiting_")) {await client.query("ROLLBACK");return NextResponse.json({error:"Payroll run is not awaiting approval"},{status:409});}
  const stage=String(run.status).replace("awaiting_","");
  if(!order.includes(stage as typeof order[number]))throw Error("Invalid stage");
  // A company account can act as CEO only for its own payroll. Other stages require assigned approvers.
  if(stage!=="ceo"){
    const permission=await client.query("SELECT 1 FROM payroll_approval_roles WHERE employer_id=$1 AND approver_id=$2 AND role=$3",[employerId,employerId,stage]);
    if(!permission.rowCount){await client.query("ROLLBACK");return NextResponse.json({error:`Only the assigned ${stage} approver can approve this stage`},{status:403});}
  }
  const index=order.indexOf(stage as typeof order[number]);
  const previous=await client.query("SELECT stage,decision FROM payroll_approval_decisions WHERE payroll_run_id=$1",[data.runId]);
  if(previous.rows.some((r:{stage:string;decision:string})=>r.decision!=="approved" || order.indexOf(r.stage as typeof order[number])>=index) || previous.rows.length!==index){
   await client.query("ROLLBACK");return NextResponse.json({error:"Previous stages must approve first"},{status:409});
  }
  await client.query("INSERT INTO payroll_approval_decisions(id,payroll_run_id,approver_id,stage,decision,note) VALUES($1,$2,$3,$4,$5,$6)",[randomUUID(),data.runId,employerId,stage,data.decision,data.note||null]);
  const newStatus=data.decision==="rejected"?"rejected":index===3?"approved":`awaiting_${order[index+1]}`;
  await client.query("UPDATE payroll_runs SET status=$1, approved_at=CASE WHEN $1='approved' THEN NOW() ELSE NULL END WHERE id=$2",[newStatus,data.runId]);
  await client.query("COMMIT");
  return NextResponse.json({status:newStatus,completedStage:stage});
 }catch{return NextResponse.json({error:"Approval failed"},{status:500});}
 finally{client.release();await pool.end();}
}
