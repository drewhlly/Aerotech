import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {currentEmployer,db} from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(request:Request){
 const employerId=await currentEmployer();if(!employerId)return NextResponse.json({error:"Unauthorized"},{status:401});
 const status=new URL(request.url).searchParams.get("status");
 if(status&&!["pending","approved","rejected"].includes(status))return NextResponse.json({error:"Invalid status"},{status:400});
 const pool=db();try{
 const r=await pool.query("SELECT r.id,r.employee_id,r.request_type,r.leave_category,r.details,r.start_date,r.end_date,r.status,r.created_at,e.first_name,e.last_name FROM employee_requests r JOIN workforce_employees e ON e.id=r.employee_id AND e.employer_id=r.employer_id WHERE r.employer_id=$1 AND ($2::text IS NULL OR r.status=$2) ORDER BY r.created_at DESC LIMIT 200",[employerId,status]);
 return NextResponse.json({requests:r.rows});
 }catch{return NextResponse.json({error:"Requests database unavailable"},{status:503});}finally{await pool.end();}
}
export async function POST(request:Request){
 const employerId=await currentEmployer();if(!employerId)return NextResponse.json({error:"Unauthorized"},{status:401});
 let b:Record<string,unknown>;try{b=await request.json();}catch{return NextResponse.json({error:"Invalid JSON"},{status:400});}
 const types=["leave","loan","salary_advance","redeployment","exit","document","expense"];
 if(typeof b.employeeId!=="string"||!types.includes(String(b.type))||typeof b.details!=="string"||!b.details.trim()||b.details.length>2500)return NextResponse.json({error:"Invalid employee, type or details"},{status:400});
 const validDate=(v:unknown)=>v===undefined||v===null||v===""||(typeof v==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(v));
 if(!validDate(b.startDate)||!validDate(b.endDate))return NextResponse.json({error:"Invalid dates"},{status:400});
 const pool=db();try{
 const r=await pool.query("INSERT INTO employee_requests(id,employer_id,employee_id,request_type,details,start_date,end_date) SELECT $1,$2,id,$3,$4,$5::date,$6::date FROM workforce_employees WHERE id=$7 AND employer_id=$2 RETURNING id",[randomUUID(),employerId,b.type,b.details.trim(),b.startDate||null,b.endDate||null,b.employeeId]);
 if(!r.rowCount)return NextResponse.json({error:"Employee not found in your company"},{status:404});
 return NextResponse.json({id:r.rows[0].id,status:"pending"},{status:201});
 }catch{return NextResponse.json({error:"Unable to submit request"},{status:400});}finally{await pool.end();}
}
