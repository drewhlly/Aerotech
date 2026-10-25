import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {currentEmployer,db} from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Unauthorized"},{status:401});
 const pool=db();try{
 const r=await pool.query(`SELECT s.id,s.title,s.question,s.active,s.created_at,s.closes_at,s.cadence,COUNT(r.id)::int AS response_count,CASE WHEN COUNT(r.id)>=5 THEN ROUND(AVG(r.rating),2) ELSE NULL END AS average_rating,CASE WHEN COUNT(r.id)>=5 THEN COUNT(r.id) FILTER(WHERE r.rating<=2)::int ELSE NULL END AS low_ratings FROM hr_surveys s LEFT JOIN hr_survey_responses r ON r.survey_id=s.id WHERE s.employer_id=$1 GROUP BY s.id ORDER BY s.created_at DESC`,[employer]);
 return NextResponse.json({surveys:r.rows,privacyThreshold:5});
 }catch{return NextResponse.json({error:"Surveys unavailable; apply database migration 024"},{status:503})}finally{await pool.end()}
}
export async function POST(request:Request){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Unauthorized"},{status:401});
 let b:{title?:unknown;question?:unknown;cadence?:unknown;closesAt?:unknown};try{b=await request.json()}catch{return NextResponse.json({error:"Invalid JSON"},{status:400})}
 if(typeof b.title!=="string"||!b.title.trim()||b.title.length>200||typeof b.question!=="string"||!b.question.trim()||b.question.length>2000||!["once","monthly","quarterly"].includes(String(b.cadence||"once")))return NextResponse.json({error:"Title, question and valid cadence required"},{status:400});
 const close=typeof b.closesAt==="string"&&b.closesAt?new Date(b.closesAt):null;if(close&&(Number.isNaN(close.getTime())||close<=new Date()))return NextResponse.json({error:"Closing date must be in the future"},{status:400});
 const pool=db();try{const id=randomUUID();await pool.query("WITH survey AS (INSERT INTO hr_surveys(id,employer_id,title,question,cadence,closes_at) VALUES($1,$2,$3,$4,$5,$6) RETURNING employer_id,title) INSERT INTO employee_notifications(id,employer_id,employee_id,title,body) SELECT gen_random_uuid(),e.employer_id,e.id,'New pulse survey','Share your feedback in Surveys: '||s.title FROM survey s JOIN workforce_employees e ON e.employer_id=s.employer_id WHERE e.employment_status IN ('active','probation','on_leave')",[id,employer,b.title.trim(),b.question.trim(),b.cadence||"once",close]);return NextResponse.json({id},{status:201})}catch{return NextResponse.json({error:"Unable to create survey; apply database migration 024"},{status:503})}finally{await pool.end()}
}
export async function PATCH(request:Request){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Unauthorized"},{status:401});
 let b:{id?:unknown;active?:unknown};try{b=await request.json()}catch{return NextResponse.json({error:"Invalid JSON"},{status:400})}
 if(typeof b.id!=="string"||typeof b.active!=="boolean")return NextResponse.json({error:"Invalid survey update"},{status:400});
 const pool=db();try{const r=await pool.query("UPDATE hr_surveys SET active=$3 WHERE id=$1 AND employer_id=$2 RETURNING id",[b.id,employer,b.active]);if(!r.rowCount)return NextResponse.json({error:"Survey not found"},{status:404});return NextResponse.json({success:true})}catch{return NextResponse.json({error:"Unable to update survey"},{status:503})}finally{await pool.end()}
}
