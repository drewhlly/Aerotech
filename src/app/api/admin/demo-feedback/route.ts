import {NextResponse} from 'next/server';
import {superAdmin} from '@/lib/super-admin';
import {db} from '@/lib/employer-session';
export const runtime='nodejs';
export async function GET(){
 if(!await superAdmin())return NextResponse.json({error:'Not found'},{status:404});
 const p=db();try{
  const r=await p.query('SELECT id,partner_name,partner_role,evaluation_date,portals,ratings,highlights,improvements,encountered_issue,issue_description,issue_severity,completion,hr_fit,competitiveness,commercial_readiness,priorities,recommendations,overall_rating,additional_comments,created_at FROM partner_demo_feedback ORDER BY created_at DESC LIMIT 250');
  return NextResponse.json({responses:r.rows},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'Unable to retrieve feedback'},{status:503})}finally{await p.end()}
}
