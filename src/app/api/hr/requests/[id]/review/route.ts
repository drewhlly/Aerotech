import {validateLeaveApproval} from '@/lib/leave-calculations';
import {notifyRequestDecision} from '@/lib/request-decision';
import {NextResponse} from "next/server";
import {currentEmployer,db} from "@/lib/employer-session";
export const runtime="nodejs";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const employerId=await currentEmployer();if(!employerId)return NextResponse.json({error:"Sign in required"},{status:401});
 const {id}=await params;
 let body:{decision?:string;note?:string};try{body=await request.json();}catch{return NextResponse.json({error:"Invalid request"},{status:400});}
 if(!body||typeof body!=="object"||Array.isArray(body)||body.note!==undefined&&(typeof body.note!=="string"||body.note.length>2000))return NextResponse.json({error:"Invalid review note"},{status:400});
 if(!["approved","rejected"].includes(body.decision||"") || (body.note||"").length>2000)return NextResponse.json({error:"Invalid decision"},{status:400});
 if(body.decision==="rejected"&&!body.note?.trim())return NextResponse.json({error:"Provide a reason for rejecting this request"},{status:400});
 const pool=db(),client=await pool.connect();try{
 await client.query("BEGIN");
 if(body.decision==='approved')await validateLeaveApproval(client,employerId,id);
 const result=await client.query("UPDATE employee_requests SET status=$1,reviewed_at=NOW(),reviewed_by=$2,review_note=$3 WHERE id=$4 AND employer_id=$2 AND status='pending' RETURNING id,status,employee_id,request_type",[body.decision,employerId,body.note||null,id]);
 if(!result.rowCount)return NextResponse.json({error:"Request not found or already reviewed"},{status:409});
 await notifyRequestDecision(client,employerId,result.rows[0]);
 await client.query("COMMIT");
 return NextResponse.json({request:result.rows[0]});
 }catch(error){const policy=error instanceof Error&&error.message.startsWith('The leave policy');return NextResponse.json({error:policy?(error as Error).message:"Unable to review request"},{status:policy?422:503});}finally{await client.query("ROLLBACK").catch(()=>{});client.release();await pool.end();}
}
