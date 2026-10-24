import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {db} from "@/lib/employer-session";
import {supportCompany,sameOrigin} from "@/lib/support-session";
import {audit,ticketSelect} from "@/lib/support-store";
export async function GET(){const company=await supportCompany();if(!company)return NextResponse.json({error:"Company admin sign-in required"},{status:401});const pool=db();try{return NextResponse.json({tickets:(await pool.query(ticketSelect+" WHERE employer_id=$1 ORDER BY created_at DESC LIMIT 100",[company])).rows},{headers:{"Cache-Control":"no-store"}});}catch{return NextResponse.json({error:"Support is unavailable"},{status:503});}finally{await pool.end();}}
export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:"Request origin not allowed"},{status:403});const company=await supportCompany();if(!company)return NextResponse.json({error:"Company admin sign-in required"},{status:401});
 let b;try{b=await request.json();}catch{return NextResponse.json({error:"Invalid request"},{status:400});}
 if(typeof b?.title!=="string"||b.title.trim().length<3||b.title.length>150||typeof b.description!=="string"||b.description.trim().length<3||b.description.length>3000)return NextResponse.json({error:"Enter a title and description within the stated limits"},{status:400});
 const pool=db(),client=await pool.connect();try{await client.query("BEGIN");const id=randomUUID();await client.query("INSERT INTO support_tickets(id,employer_id,title,description) VALUES($1,$2,$3,$4)",[id,company,b.title.trim(),b.description.trim()]);await audit(client,company,id,"company",company,"ticket_created");await client.query("COMMIT");return NextResponse.json({id},{status:201});}catch{await client.query("ROLLBACK").catch(()=>{});return NextResponse.json({error:"Unable to create ticket"},{status:503});}finally{client.release();await pool.end();}
}
