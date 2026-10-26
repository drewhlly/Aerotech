import {NextResponse} from 'next/server';
import {randomBytes,createHash} from 'node:crypto';
import {db} from '@/lib/employer-session';
import {hashPassword} from '@/lib/employee-auth';
import {siteUrl} from '@/lib/seo';
export const runtime='nodejs';
const digest=(token:string)=>createHash('sha256').update(token).digest('hex');
const generic={ok:true,message:'If this account is eligible, a password reset link will be emailed shortly. Check your inbox and spam folder.'};
const accounts={employer:{lookup:'SELECT id FROM employer_accounts WHERE company_email=$1',update:'UPDATE employer_accounts SET password_hash=$1 WHERE id=$2',sessions:'DELETE FROM employer_sessions WHERE employer_id=$1'},applicant:{lookup:'SELECT id FROM applicant_accounts WHERE email=$1',update:'UPDATE applicant_accounts SET password_hash=$1 WHERE id=$2',sessions:'DELETE FROM applicant_sessions WHERE applicant_id=$1'},employee:{lookup:"SELECT e.id FROM workforce_employees e JOIN employee_credentials c ON c.employee_id=e.id WHERE LOWER(e.email)=$1 AND e.employment_status IN ('active','probation','on_leave')",update:'UPDATE employee_credentials SET password_hash=$1 WHERE employee_id=$2',sessions:'DELETE FROM employee_sessions WHERE employee_id=$1'}};
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return NextResponse.json({error:'Invalid origin'},{status:403});
 let b;try{b=await req.json()}catch{return NextResponse.json({error:'Invalid request'},{status:400})}
 if(!b||!Object.hasOwn(accounts,b.role))return NextResponse.json({error:'Choose a valid account role'},{status:400});
 const role=b.role as keyof typeof accounts,queries=accounts[role];
 if(b.action==='request'){
  if(typeof b.email!=='string'||b.email.length>255||!/^\S+@\S+\.\S+$/.test(b.email))return NextResponse.json({error:'Enter a valid email address'},{status:400});
  if(!process.env.RESEND_API_KEY||!process.env.INVITATION_FROM_EMAIL)return NextResponse.json({error:'Password recovery email is unavailable. Contact support or your HR team.'},{status:503});
  const p=db();try{const r=await p.query(queries.lookup,[b.email.trim().toLowerCase()]);if(r.rowCount!==1)return NextResponse.json(generic);
   const id=r.rows[0].id,token=randomBytes(32).toString('hex');
   // Atomic account-scoped throttling across server instances.
   const c=await p.connect();try{await c.query('BEGIN');await c.query('SELECT pg_advisory_xact_lock(hashtext($1))',[role+id]);const recent=await c.query("SELECT 1 FROM account_password_resets WHERE account_role=$1 AND account_id=$2 AND created_at>NOW()-INTERVAL '1 hour' LIMIT 3",[role,id]);if(recent.rowCount===3){await c.query('ROLLBACK');return NextResponse.json(generic)}await c.query("INSERT INTO account_password_resets(token_hash,account_role,account_id,expires_at) VALUES($1,$2,$3,NOW()+INTERVAL '30 minutes')",[digest(token),role,id]);await c.query('COMMIT')}finally{await c.query('ROLLBACK').catch(()=>{});c.release()}
   const link=new URL('/auth/reset-password',siteUrl);link.search=new URLSearchParams({token,role}).toString();
   const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.INVITATION_FROM_EMAIL,to:[b.email.trim().toLowerCase()],subject:'Reset your Aerotech password',text:'A password reset was requested for your '+role+' account. Use this link within 30 minutes: '+link.href+'\nIf you did not request this, ignore this email.'}),signal:AbortSignal.timeout(12000)});
   if(!response.ok){await p.query('DELETE FROM account_password_resets WHERE token_hash=$1',[digest(token)]);return NextResponse.json({error:'Recovery email could not be sent. Please contact support.'},{status:503})}
   return NextResponse.json(generic);
  }catch{return NextResponse.json({error:'Recovery is unavailable. Please contact support.'},{status:503})}finally{await p.end()}
 }
 if(b.action!=='reset'||typeof b.token!=='string'||!/^([a-f0-9]{64})$/.test(b.token)||typeof b.password!=='string'||b.password.length<12||b.password.length>255)return NextResponse.json({error:'Use a valid reset link and a password of 12–255 characters'},{status:400});
 const p=db(),c=await p.connect();try{await c.query('BEGIN');const r=await c.query('SELECT account_id FROM account_password_resets WHERE token_hash=$1 AND account_role=$2 AND used_at IS NULL AND expires_at>NOW() FOR UPDATE',[digest(b.token),role]);if(!r.rowCount)return NextResponse.json({error:'This reset link is invalid or expired. Request a new one.'},{status:400});const id=r.rows[0].account_id;await c.query(queries.update,[await hashPassword(b.password),id]);await c.query(queries.sessions,[id]);await c.query('UPDATE account_password_resets SET used_at=NOW() WHERE account_role=$1 AND account_id=$2 AND used_at IS NULL',[role,id]);await c.query('COMMIT');return NextResponse.json({ok:true})}catch{return NextResponse.json({error:'Unable to reset your password. Please retry.'},{status:503})}finally{await c.query('ROLLBACK').catch(()=>{});c.release();await p.end()}
}
