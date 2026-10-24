import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {currentEmployee} from "@/lib/employee-auth";
import {db} from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(){
 const e=await currentEmployee();if(!e)return NextResponse.json({error:"Sign in required"},{status:401});
 const pool=db();try{
 const r=await pool.query("SELECT s.id,s.title,s.question,s.closes_at,s.cadence,EXISTS(SELECT 1 FROM hr_survey_responses r WHERE r.survey_id=s.id AND r.employee_id=$2) AS responded FROM hr_surveys s WHERE s.employer_id=$1 AND s.active=true AND (s.closes_at IS NULL OR s.closes_at>NOW()) ORDER BY s.created_at DESC LIMIT 50",[e.employer_id,e.id]);
 return NextResponse.json({surveys:r.rows});
 }catch{return NextResponse.json({error:"Surveys unavailable; database migration may be pending"},{status:503})}finally{await pool.end()}
}
export async function POST(request:Request){
 const e=await currentEmployee();if(!e)return NextResponse.json({error:"Sign in required"},{status:401});
 let b:{surveyId?:unknown;rating?:unknown;feedback?:unknown};try{b=await request.json()}catch{return NextResponse.json({error:"Invalid request"},{status:400})}
 if(typeof b.surveyId!=="string"||!Number.isInteger(b.rating)||Number(b.rating)<1||Number(b.rating)>5||typeof b.feedback!=="string"||b.feedback.length>1000)return NextResponse.json({error:"Provide a rating from 1 to 5 and optional feedback (up to 1000 characters)"},{status:400});
 const pool=db();try{
 const s=await pool.query("SELECT id FROM hr_surveys WHERE id=$1 AND employer_id=$2 AND active=true AND (closes_at IS NULL OR closes_at>NOW())",[b.surveyId,e.employer_id]);if(!s.rowCount)return NextResponse.json({error:"Survey is closed or unavailable"},{status:404});
 await pool.query("INSERT INTO hr_survey_responses(id,survey_id,employee_id,rating,comment) VALUES($1,$2,$3,$4,$5)",[randomUUID(),b.surveyId,e.id,b.rating,b.feedback.trim()]);
 return NextResponse.json({success:true},{status:201});
 }catch(err){if(typeof err==="object"&&err!==null&&"code" in err&&err.code==="23505")return NextResponse.json({error:"You have already responded"},{status:409});return NextResponse.json({error:"Unable to save response; database migration may be pending"},{status:503})}finally{await pool.end()}
}
