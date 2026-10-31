import {NextResponse} from "next/server";
import {currentEmployer,db} from "@/lib/employer-session";
export const runtime="nodejs";
const stages=["hr","finance","ceo"];
export async function GET(){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Employer sign-in required"},{status:401});
 const pool=db();try{const r=await pool.query("SELECT a.stage,a.employee_id,e.first_name,e.last_name FROM payroll_stage_approvers a JOIN workforce_employees e ON e.id=a.employee_id AND e.employer_id=a.employer_id WHERE a.employer_id=$1 ORDER BY array_position(ARRAY['hr','finance','ceo']::text[],a.stage)",[employer]);return NextResponse.json({approvers:r.rows});}catch{return NextResponse.json({error:"Approvers unavailable"},{status:503});}finally{await pool.end();}
}
export async function POST(request:Request){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Employer sign-in required"},{status:401});
 let b:{stage?:unknown;employeeId?:unknown};try{b=await request.json().catch(()=>null);
 if(!b||typeof b!=='object'||Array.isArray(b))return NextResponse.json({error:'Request body must be a JSON object.'},{status:400});
}catch{return NextResponse.json({error:"Invalid request"},{status:400});}
 if(!stages.includes(String(b.stage))||typeof b.employeeId!=="string")return NextResponse.json({error:"Stage and employee required"},{status:400});
 const pool=db();try{
 const r=await pool.query("INSERT INTO payroll_stage_approvers(employer_id,stage,employee_id) SELECT $1,$2,id FROM workforce_employees WHERE employer_id=$1 AND id=$3 AND employment_status='active' ON CONFLICT(employer_id,stage) DO UPDATE SET employee_id=EXCLUDED.employee_id RETURNING stage",[employer,b.stage,b.employeeId]);
 if(!r.rowCount)return NextResponse.json({error:"Active company employee not found"},{status:404});
 return NextResponse.json({stage:r.rows[0].stage});
 }catch{return NextResponse.json({error:"Each stage must have a different approver; check employee assignment"},{status:409});}finally{await pool.end();}
}
