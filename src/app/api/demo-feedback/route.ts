import {NextResponse} from 'next/server';
import {db} from '@/lib/employer-session';
export const runtime='nodejs';
const allowedPortals=['Employer','Head of HR','Finance','CEO','Applicant'];
const fields=['design','navigation','speed','clarity','functionality','devices','overall'];
const completion=['all','most','some','none'];
const competition=['highly','competitive','improvements','significant','unsure'];
const readiness=['yes','minor','important','no'];
const severity=['minor','moderate','critical','na'];
const str=(v:unknown,max:number)=>typeof v==='string'&&v.trim().length<=max?v.trim():null;
export async function POST(req:Request){
 try{
  const origin=req.headers.get('origin');const host=req.headers.get('host');
  if(!origin||!host||new URL(origin).host!==host)return NextResponse.json({error:'Invalid origin'},{status:403});
  const raw=await req.text();if(raw.length>16000)return NextResponse.json({error:'Submission too large'},{status:413});
  const b=JSON.parse(raw);if(!b||typeof b!=='object'||Array.isArray(b))throw Error('Invalid');
  if(b.website)return NextResponse.json({ok:true},{status:201}); // Honeypot: no stored data
  const name=str(b.name,120),role=str(b.role,160),date=str(b.date,10);
  if(!name||name.length<2||!role||!date||!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date)))throw Error('Identity fields');
  if(!Array.isArray(b.portals)||!b.portals.length||b.portals.length>5||b.portals.some((x:unknown)=>!allowedPortals.includes(String(x))))throw Error('Portals');
  const ratings=b.ratings;if(!ratings||typeof ratings!=='object'||fields.some(k=>!Number.isInteger(ratings[k])||ratings[k]<1||ratings[k]>5))throw Error('Ratings');
  const highlights=str(b.highlights,2000),improvements=str(b.improvements,2000),issue=str(b.issue,2000),priorities=str(b.priorities,2000),comments=str(b.comments,2000);
  if(highlights===null||improvements===null||issue===null||priorities===null||comments===null)throw Error('Text');
  if(typeof b.hasIssue!=='boolean'||(b.hasIssue&&!issue))throw Error('Issue');
  if(!severity.includes(b.severity)||!completion.includes(b.completion)||!competition.includes(b.competition)||!readiness.includes(b.readiness))throw Error('Choice');
  if(!Number.isInteger(b.hrFit)||b.hrFit<1||b.hrFit>5||!Number.isInteger(b.overall)||b.overall<1||b.overall>10)throw Error('Scores');
  if(!Array.isArray(b.recommendations)||b.recommendations.length!==3||b.recommendations.some((x:unknown)=>str(x,700)===null))throw Error('Recommendations');
  const p=db();try{
   await p.query(`INSERT INTO partner_demo_feedback(partner_name,partner_role,evaluation_date,portals,ratings,highlights,improvements,encountered_issue,issue_description,issue_severity,completion,hr_fit,competitiveness,commercial_readiness,priorities,recommendations,overall_rating,additional_comments) VALUES($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
    [name,role,date,b.portals,JSON.stringify(Object.fromEntries(fields.map(k=>[k,ratings[k]]))),highlights,improvements,b.hasIssue,b.hasIssue?issue:null,b.hasIssue?b.severity:'na',b.completion,b.hrFit,b.competition,b.readiness,priorities,b.recommendations,b.overall,comments]);
  }finally{await p.end()}
  return NextResponse.json({ok:true},{status:201});
 }catch(e){if(e instanceof SyntaxError||e instanceof Error&&['Invalid','Identity fields','Portals','Ratings','Text','Issue','Choice','Scores','Recommendations'].includes(e.message))return NextResponse.json({error:'Please review the required fields.'},{status:400});return NextResponse.json({error:'Unable to save feedback right now.'},{status:503})}
}
