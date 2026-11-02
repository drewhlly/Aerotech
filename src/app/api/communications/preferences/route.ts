import {NextResponse} from 'next/server';
import {privacyActor} from '@/lib/privacy-actor';
import {db} from '@/lib/employer-session';
import {defaultPreferences,parsePreferences} from '@/lib/communication-policy';
export const runtime='nodejs';
const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
export async function GET(){
 const a=await privacyActor();if(!a||a.role==='admin')return reply({error:'Sign in to your account.'},401);
 const p=db();try{
  const preferences=(await p.query('SELECT job_alerts,newsletter,product_updates,company_ids FROM communication_preferences WHERE role=$1 AND account_id=$2',[a.role,a.id])).rows[0]||defaultPreferences;
  const companies=a.role==='applicant'?(await p.query("SELECT DISTINCT e.id,e.company_name FROM employer_accounts e JOIN ats_jobs j ON j.employer_id=e.id WHERE j.status='published' AND j.expires_at>NOW() AND (j.deadline IS NULL OR j.deadline>NOW()) ORDER BY e.company_name LIMIT 500")).rows:[];
  return reply({role:a.role,preferences,companies});
 }catch{return reply({error:'Email preferences are temporarily unavailable.'},503)}finally{await p.end();}
}
export async function PUT(req:Request){
 const a=await privacyActor();if(!a||a.role==='admin')return reply({error:'Sign in to your account.'},401);
 let b;try{if(Number(req.headers.get('content-length'))>16000)throw Error('Request too large.');b=parsePreferences(await req.json(),a.role as 'applicant'|'employee'|'employer')}catch(e){return reply({error:e instanceof Error?e.message:'Invalid preferences.'},400)}
 const p=db();try{
  if(b.company_ids.length){const valid=await p.query('SELECT id FROM employer_accounts WHERE id=ANY($1::uuid[])',[b.company_ids]);if(valid.rowCount!==b.company_ids.length)return reply({error:'One of the selected companies is unavailable.'},400);}
  await p.query(`INSERT INTO communication_preferences(role,account_id,job_alerts,newsletter,product_updates,company_ids) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(role,account_id) DO UPDATE SET job_alerts=EXCLUDED.job_alerts,newsletter=EXCLUDED.newsletter,product_updates=EXCLUDED.product_updates,company_ids=EXCLUDED.company_ids,job_alerts_since=CASE WHEN NOT communication_preferences.job_alerts AND EXCLUDED.job_alerts THEN NOW() ELSE communication_preferences.job_alerts_since END,updated_at=NOW()`,[a.role,a.id,b.job_alerts,b.newsletter,b.product_updates,b.company_ids]);
  return reply({ok:true});
 }catch{return reply({error:'Unable to save email preferences.'},503)}finally{await p.end();}
}
