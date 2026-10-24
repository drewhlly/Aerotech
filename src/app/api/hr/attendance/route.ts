import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {currentEmployer,db} from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(request:Request){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Unauthorized"},{status:401});
 const date=new URL(request.url).searchParams.get("date");
 if(date&&!/^\d{4}-\d{2}-\d{2}$/.test(date))return NextResponse.json({error:"Invalid date"},{status:400});
 const pool=db();try{const r=await pool.query("SELECT a.id,a.employee_id,a.work_date,a.event_type,a.event_time,a.source,e.first_name,e.last_name FROM hr_attendance_events a JOIN workforce_employees e ON e.id=a.employee_id AND e.employer_id=a.employer_id WHERE a.employer_id=$1 AND ($2::date IS NULL OR a.work_date=$2) ORDER BY a.event_time DESC LIMIT 300",[employer,date]);return NextResponse.json({events:r.rows});}catch{return NextResponse.json({error:"Attendance unavailable"},{status:503});}finally{await pool.end();}
}
export async function POST(request:Request){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Unauthorized"},{status:401});
 let b:{employeeId?:unknown;eventType?:unknown;date?:unknown};try{b=await request.json();}catch{return NextResponse.json({error:"Invalid request"},{status:400});}
 if(typeof b.employeeId!=="string"||!["clock_in","clock_out"].includes(String(b.eventType))||typeof b.date!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(b.date))return NextResponse.json({error:"Employee, event and date required"},{status:400});
 const pool=db();try{
 const r=await pool.query("INSERT INTO hr_attendance_events(id,employer_id,employee_id,work_date,event_type) SELECT $1,$2,id,$3::date,$4 FROM workforce_employees WHERE id=$5 AND employer_id=$2 RETURNING id",[randomUUID(),employer,b.date,b.eventType,b.employeeId]);
 if(!r.rowCount)return NextResponse.json({error:"Employee not found"},{status:404});return NextResponse.json({id:r.rows[0].id},{status:201});
 }catch{return NextResponse.json({error:"Attendance may already be recorded for this employee and date"},{status:409});}finally{await pool.end();}
}
