import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {db} from "@/lib/employer-session";
import {supportCompany,sameOrigin} from "@/lib/support-session";
import {audit,ticketHistory,ticketSelect} from "@/lib/support-store";
import {validateGrant} from "@/lib/support-security";
type Context={params:Promise<{id:string}>};
async function handle(request:Request,context:Context,write:boolean){
 if(write&&!sameOrigin(request))return NextResponse.json({error:"Request origin not allowed"},{status:403});
 const company=await supportCompany();if(!company)return NextResponse.json({error:"Company admin sign-in required"},{status:401});const {id}=await context.params;if(!/^[a-f0-9-]{36}$/i.test(id))return NextResponse.json({error:"Ticket not found"},{status:404});
 let b;if(write){try{b=await request.json();}catch{return NextResponse.json({error:"Invalid request"},{status:400});}}
 const pool=db(),client=await pool.connect();try{
 await client.query("BEGIN");const ticket=(await client.query(ticketSelect+" WHERE id=$1 AND employer_id=$2 FOR UPDATE",[id,company])).rows[0];
 if(!ticket){await client.query("ROLLBACK");return NextResponse.json({error:"Ticket not found"},{status:404});}
 if(write){
  if(b?.action==="grant"&&ticket.status==="open"&&validateGrant(b.scopes,b.minutes)){
   await client.query("UPDATE support_grants SET revoked_at=NOW() WHERE ticket_id=$1 AND revoked_at IS NULL",[id]);
   const grant=randomUUID();await client.query("INSERT INTO support_grants(id,ticket_id,employer_id,scopes,expires_at) VALUES($1,$2,$3,$4,NOW()+($5::int*INTERVAL '1 minute'))",[grant,id,company,b.scopes,Number(b.minutes)]);
   await audit(client,company,id,"company",company,"access_approved",{grantId:grant,scopes:b.scopes,minutes:Number(b.minutes)});
  }else if(b?.action==="revoke"){
   await client.query("UPDATE support_grants SET revoked_at=NOW() WHERE ticket_id=$1 AND revoked_at IS NULL",[id]);await audit(client,company,id,"company",company,"access_revoked");
  }else if(b?.action==="close"&&ticket.status==="open"&&typeof b.summary==="string"&&b.summary.trim().length>=3&&b.summary.length<=2000){
   await client.query("UPDATE support_tickets SET status='closed',resolution=$1,closed_at=NOW() WHERE id=$2",[b.summary.trim(),id]);await client.query("UPDATE support_grants SET revoked_at=NOW() WHERE ticket_id=$1 AND revoked_at IS NULL",[id]);await audit(client,company,id,"company",company,"ticket_closed",{summary:b.summary.trim()});ticket.status="closed";ticket.resolution=b.summary.trim();
  }else{await client.query("ROLLBACK");return NextResponse.json({error:"Invalid action, scope or duration. Closed tickets cannot grant access."},{status:400});}
 }
 const history=await ticketHistory(client,id);await client.query("COMMIT");return NextResponse.json({ticket,...history},{headers:{"Cache-Control":"no-store"}});
 }catch{await client.query("ROLLBACK").catch(()=>{});return NextResponse.json({error:"Support request failed"},{status:503});}finally{client.release();await pool.end();}
}
export async function GET(r:Request,c:Context){return handle(r,c,false);}export async function POST(r:Request,c:Context){return handle(r,c,true);}
