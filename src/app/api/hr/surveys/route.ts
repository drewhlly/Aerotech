import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {currentEmployer,db} from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Unauthorized"},{status:401});
 const pool=db();try{const r=await pool.query("SELECT s.id,s.title,s.question,s.active,s.created_at,COUNT(r.id)::int AS response_count,ROUND(AVG(r.rating),2) AS average_rating FROM hr_surveys s LEFT JOIN hr_survey_responses r ON r.survey_id=s.id WHERE s.employer_id=$1 GROUP BY s.id ORDER BY s.created_at DESC",[employer]);return NextResponse.json({surveys:r.rows});}catch{return NextResponse.json({error:"Surveys unavailable"},{status:503});}finally{await pool.end();}
}
export async function POST(request:Request){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Unauthorized"},{status:401});
 let b:{title?:unknown;question?:unknown};try{b=await request.json();}catch{return NextResponse.json({error:"Invalid JSON"},{status:400});}
 if(typeof b.title!=="string"||!b.title.trim()||b.title.length>200||typeof b.question!=="string"||!b.question.trim()||b.question.length>2000)return NextResponse.json({error:"Title and question required"},{status:400});
 const pool=db();try{const id=randomUUID();await pool.query("INSERT INTO hr_surveys(id,employer_id,title,question) VALUES($1,$2,$3,$4)",[id,employer,b.title.trim(),b.question.trim()]);return NextResponse.json({id},{status:201});}catch{return NextResponse.json({error:"Unable to create survey"},{status:503});}finally{await pool.end();}
}
