import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { currentEmployer,db } from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Unauthorized"},{status:401});
 const pool=db();try{
 const r=await pool.query("SELECT g.id,g.employee_id,g.title,g.description,g.target_date,g.progress,g.status,e.first_name,e.last_name FROM hr_performance_goals g JOIN workforce_employees e ON e.id=g.employee_id AND e.employer_id=g.employer_id WHERE g.employer_id=$1 ORDER BY g.created_at DESC LIMIT 200",[employer]);
 return NextResponse.json({goals:r.rows});
 }catch{return NextResponse.json({error:"Goals unavailable"},{status:503});}finally{await pool.end();}
}
export async function POST(request:Request){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Unauthorized"},{status:401});
 let b:Record<string,unknown>;try{b=await request.json();}catch{return NextResponse.json({error:"Invalid JSON"},{status:400});}
 if(typeof b.employeeId!=="string"||typeof b.title!=="string"||!b.title.trim()||b.title.length>200||typeof b.description!=="string"||b.description.length>2000||b.targetDate&&!(typeof b.targetDate==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(b.targetDate)))return NextResponse.json({error:"Invalid goal"},{status:400});
 const pool=db();try{
 const r=await pool.query("INSERT INTO hr_performance_goals(id,employer_id,employee_id,title,description,target_date) SELECT $1,$2,id,$3,$4,$5::date FROM workforce_employees WHERE id=$6 AND employer_id=$2 RETURNING id",[randomUUID(),employer,b.title.trim(),b.description,b.targetDate||null,b.employeeId]);
 if(!r.rowCount)return NextResponse.json({error:"Employee not found"},{status:404});
 return NextResponse.json({id:r.rows[0].id},{status:201});
 }catch{return NextResponse.json({error:"Could not save goal"},{status:503});}finally{await pool.end();}
}
