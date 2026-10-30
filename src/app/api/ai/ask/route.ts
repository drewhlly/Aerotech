import {NextResponse} from 'next/server';
import {currentEmployer,db} from '@/lib/employer-session';
import {authAttempt} from '@/lib/auth-rate-limit';
import {generalQuestions,type GeneralQuestion} from '@/lib/ai-prompts';
export const runtime='nodejs';
const headers={'Cache-Control':'private, no-store'};
export async function GET(){const employer=await currentEmployer();if(!employer)return NextResponse.json({error:'Sign in as an employer with AI access.'},{status:401,headers});return NextResponse.json({configured:!!process.env.GEMINI_API_KEY},{headers})}
export async function POST(request:Request){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:'Sign in as an employer with AI access.'},{status:401,headers});
 let body:unknown;try{body=await request.json()}catch{return NextResponse.json({error:'Invalid request.'},{status:400,headers})}
 if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).length!==1||!Object.hasOwn(body,'topic'))return NextResponse.json({error:'Select one of the available general questions.'},{status:400,headers});
 const topic=(body as {topic?:unknown}).topic;if(typeof topic!=='string'||!Object.hasOwn(generalQuestions,topic))return NextResponse.json({error:'Select one of the available general questions.'},{status:400,headers});
 const key=process.env.GEMINI_API_KEY;if(!key)return NextResponse.json({error:'Aerotech AI is not connected yet.'},{status:503,headers});
 try{const pool=db();try{if(!await authAttempt(pool,'ai',employer))return NextResponse.json({error:'Question limit reached. Please try again later.'},{status:429,headers})}finally{await pool.end()}
 const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({systemInstruction:{parts:[{text:'Provide concise general HR guidance. Never claim to know an organisation or employee. Employment, payroll and legal rules vary by jurisdiction; recommend qualified local review where appropriate. Humans make employment decisions.'}]},contents:[{role:'user',parts:[{text:generalQuestions[topic as GeneralQuestion]}]}],generationConfig:{maxOutputTokens:1000}}),signal:AbortSignal.timeout(20000)});
 if(response.status===429)return NextResponse.json({error:'The AI service has reached its free-tier limit. Please try again later.'},{status:429,headers});if(!response.ok)return NextResponse.json({error:'The AI service is unavailable. Please try again later.'},{status:502,headers});
 const data:{candidates?:{content?:{parts?:{text?:string}[]}}[]}=await response.json();const answer=data.candidates?.[0]?.content?.parts?.map(x=>x.text||'').join('').trim();if(!answer)return NextResponse.json({error:'No response was returned. Please try again.'},{status:502,headers});return NextResponse.json({answer},{headers});
 }catch{return NextResponse.json({error:'The AI request timed out or failed. Please try again.'},{status:502,headers})}
}
