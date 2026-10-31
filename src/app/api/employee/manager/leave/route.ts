import {notifyRequestDecision} from '@/lib/request-decision';
import {NextResponse} from "next/server";
import {currentEmployee} from "@/lib/employee-auth";
import {db} from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(){
 const manager=await currentEmployee();if(!manager)return NextResponse.json({error:"Unauthorized"},{status:401});
 const pool=db();try{const assigned=await pool.query("SELECT 1 FROM workforce_employees WHERE employer_id=$1 AND manager_employee_id=$2 AND id<>$2 AND employment_status IN ('active','probation','on_leave') LIMIT 1",[manager.employer_id,manager.id]);if(!assigned.rowCount)return NextResponse.json({error:'No leave approval responsibility assigned'},{status:403});const r=await pool.query("SELECT r.id,r.employee_id,r.start_date,r.end_date,r.leave_category,r.details,r.created_at,e.first_name,e.last_name FROM employee_requests r JOIN workforce_employees e ON e.id=r.employee_id AND e.employer_id=r.employer_id WHERE r.employer_id=$1 AND e.manager_employee_id=$2 AND e.id<>$2 AND r.request_type='leave' AND r.status='pending' ORDER BY r.created_at ASC",[manager.employer_id,manager.id]);return NextResponse.json({requests:r.rows});}
 catch{return NextResponse.json({error:"Leave approvals unavailable"},{status:503});}finally{await pool.end();}
}
export async function POST(request:Request){
 const manager=await currentEmployee();if(!manager)return NextResponse.json({error:"Unauthorized"},{status:401});
 let b:{requestId?:unknown;decision?:unknown;note?:unknown};try{b=await request.json();}catch{return NextResponse.json({error:"Invalid JSON"},{status:400});}
 if(!b||typeof b!=="object"||Array.isArray(b))return NextResponse.json({error:"Invalid request"},{status:400});
 if(typeof b.requestId!=="string"||!["approved","rejected"].includes(String(b.decision))||typeof b.note!=="string"||!b.note.trim()||b.note.length>1000)return NextResponse.json({error:"Request, decision and review note required"},{status:400});
 const pool=db(),client=await pool.connect();try{
 await client.query('BEGIN');
 const r=await client.query("UPDATE employee_requests r SET status=$1,reviewed_by_employee_id=$2,reviewed_at=NOW(),review_note=$3 FROM workforce_employees e WHERE r.id=$4 AND r.employer_id=$5 AND r.employee_id=e.id AND e.employer_id=r.employer_id AND e.manager_employee_id=$2 AND e.id<>$2 AND r.status='pending' AND r.request_type='leave' RETURNING r.id,r.employee_id,r.request_type,r.status",[b.decision,manager.id,b.note.trim(),b.requestId,manager.employer_id]);
 if(!r.rowCount)return NextResponse.json({error:"Request not found or outside your direct reports"},{status:404});
 await notifyRequestDecision(client,manager.employer_id,r.rows[0]);
 await client.query('COMMIT');
 return NextResponse.json({ok:true,status:b.decision});
 }catch{return NextResponse.json({error:"Unable to review request"},{status:503});}finally{await client.query('ROLLBACK').catch(()=>{});client.release();await pool.end();}
}
