import {NextResponse} from 'next/server';
import {randomUUID} from 'node:crypto';
import {currentEmployee} from '@/lib/employee-auth';
import {db} from '@/lib/employer-session';
import {enrollWorkflows} from '@/lib/workflow-automation';
export const runtime='nodejs';
const headers={'Cache-Control':'private, no-store'};
export async function GET(){
 const employee=await currentEmployee();if(!employee)return NextResponse.json({error:'Employee sign-in required'},{status:401,headers});
 const pool=db();try{
  await enrollWorkflows(pool,employee.employer_id);
  const [tasks,submissions,settings]=await Promise.all([
   pool.query('SELECT id,title,status,due_date,automation_key FROM employee_onboarding_tasks WHERE employer_id=$1 AND employee_id=$2 ORDER BY due_date NULLS LAST,created_at,id',[employee.employer_id,employee.id]),
   pool.query('SELECT id,title,credential_type,status,feedback,reviewed_at FROM workforce_submissions WHERE employer_id=$1 AND employee_id=$2 ORDER BY created_at DESC LIMIT 100',[employee.employer_id,employee.id]),
   pool.query(`SELECT s.credential_types,s.confidentiality_title AS title,s.confidentiality_text AS text,s.confidentiality_version AS version,EXISTS(SELECT 1 FROM employee_agreement_acknowledgements a WHERE a.employer_id=s.employer_id AND a.employee_id=$2 AND a.version=s.confidentiality_version) AS acknowledged FROM company_workflow_settings s WHERE s.employer_id=$1`,[employee.employer_id,employee.id])]);
  const policy=settings.rows[0];
  return NextResponse.json({tasks:tasks.rows,submissions:submissions.rows,credentialTypes:policy?.credential_types||['identity','qualification','reference'],agreement:policy?.text?{title:policy.title,text:policy.text,version:policy.version,acknowledged:policy.acknowledged}:null},{headers});
 }catch{return NextResponse.json({error:'Onboarding is temporarily unavailable'},{status:503,headers});}finally{await pool.end();}
}
export async function POST(req:Request){
 const employee=await currentEmployee();if(!employee)return NextResponse.json({error:'Employee sign-in required'},{status:401,headers});
 let body:Record<string,unknown>;try{body=await req.json();}catch{return NextResponse.json({error:'Invalid request'},{status:400,headers});}
 if(!body||typeof body!=='object'||Array.isArray(body)||body.action!=='acknowledge_agreement'||body.accepted!==true||!Number.isInteger(body.version))return NextResponse.json({error:'Read the agreement and explicitly acknowledge the current version.'},{status:400,headers});
 const pool=db(),client=await pool.connect();try{
  await client.query('BEGIN');
  const settings=await client.query('SELECT confidentiality_title AS title,confidentiality_text AS text,confidentiality_version AS version FROM company_workflow_settings WHERE employer_id=$1 FOR SHARE',[employee.employer_id]);
  const agreement=settings.rows[0];
  if(!agreement?.text||agreement.version!==body.version)return NextResponse.json({error:'The agreement has changed or is not assigned. Refresh your onboarding page.'},{status:409,headers});
  const saved=await client.query('INSERT INTO employee_agreement_acknowledgements(id,employer_id,employee_id,version,title,agreement_text) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(employee_id,version) DO NOTHING RETURNING id',[randomUUID(),employee.employer_id,employee.id,agreement.version,agreement.title,agreement.text]);
  await client.query('COMMIT');return NextResponse.json({ok:true,reused:!saved.rowCount},{headers});
 }catch{return NextResponse.json({error:'Unable to save your acknowledgement'},{status:503,headers});}
 finally{await client.query('ROLLBACK').catch(()=>{});client.release();await pool.end();}
}
