import {NextResponse} from "next/server";
import {db} from "@/lib/employer-session";
import {supportAgent,sameOrigin} from "@/lib/support-session";
import {audit,ticketHistory} from "@/lib/support-store";
type Context={params:Promise<{id:string}>};
async function handle(request:Request,context:Context,write:boolean){
 if(write&&!sameOrigin(request))return NextResponse.json({error:"Request origin not allowed"},{status:403});const agent=await supportAgent();if(!agent)return NextResponse.json({error:"Support sign-in required"},{status:401});const {id}=await context.params;if(!/^[a-f0-9-]{36}$/i.test(id))return NextResponse.json({error:"Ticket not found"},{status:404});let b;if(write){try{b=await request.json();}catch{return NextResponse.json({error:"Invalid request"},{status:400});}}
 const pool=db(),client=await pool.connect();try{
 await client.query("BEGIN");const ticket=(await client.query("SELECT id,employer_id,title,description,status,resolution,created_at,closed_at FROM support_tickets WHERE id=$1 FOR UPDATE",[id])).rows[0];
 if(!ticket){await client.query("ROLLBACK");return NextResponse.json({error:"Ticket not found"},{status:404});}
 if(write){if(b?.action!=="close"||ticket.status!=="open"||typeof b.summary!=="string"||b.summary.trim().length<3||b.summary.length>2000){await client.query("ROLLBACK");return NextResponse.json({error:"A resolution summary is required to close an open ticket. Customer records cannot be changed here."},{status:400});}
 await client.query("UPDATE support_tickets SET status='closed',resolution=$1,closed_at=NOW() WHERE id=$2",[b.summary.trim(),id]);await client.query("UPDATE support_grants SET revoked_at=NOW() WHERE ticket_id=$1 AND revoked_at IS NULL",[id]);ticket.status="closed";ticket.resolution=b.summary.trim();await audit(client,ticket.employer_id,id,"support",agent.id,"ticket_closed",{summary:b.summary.trim()});
 }else await audit(client,ticket.employer_id,id,"support",agent.id,"ticket_viewed");
 const history=await ticketHistory(client,id);await client.query("COMMIT");return NextResponse.json({ticket,...history},{headers:{"Cache-Control":"no-store"}});
 }catch{await client.query("ROLLBACK").catch(()=>{});return NextResponse.json({error:"Support request failed"},{status:503});}finally{client.release();await pool.end();}
}
export async function GET(r:Request,c:Context){return handle(r,c,false);}export async function POST(r:Request,c:Context){return handle(r,c,true);}
