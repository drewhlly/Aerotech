import {NextResponse} from 'next/server';
import {randomUUID} from 'node:crypto';
import {currentEmployer,db} from '@/lib/employer-session';
import {currentEmployee} from '@/lib/employee-auth';
import {calendarDate} from '@/lib/leave-requests';
import {applyScheduledConfirmations} from '@/lib/confirmation-automation';
export const runtime='nodejs';
const headers={'Cache-Control':'private, no-store'};
const uuid=(value:unknown):value is string=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export async function GET(){
 const employer=await currentEmployer(),employee=employer?null:await currentEmployee();
 if(!employer&&!employee)return NextResponse.json({error:'Sign in required'},{status:401,headers});
 const pool=db();try{
  const r=await pool.query(`SELECT c.*,e.first_name,e.last_name FROM employee_confirmation_decisions c JOIN workforce_employees e ON e.id=c.employee_id AND e.employer_id=c.employer_id WHERE c.employer_id=$1 ${employee?'AND c.employee_id=$2':''} ORDER BY c.created_at DESC,c.id DESC`,employee?[employee.employer_id,employee.id]:[employer]);
  return NextResponse.json({records:r.rows},{headers});
 }catch{return NextResponse.json({error:'Confirmation records unavailable'},{status:503,headers});}finally{await pool.end();}
}
export async function POST(req:Request){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:'HR access required'},{status:401,headers});
 let body:Record<string,unknown>;try{body=await req.json();}catch{return NextResponse.json({error:'Invalid request'},{status:400,headers});}
 if(!body||typeof body!=='object'||Array.isArray(body)||!uuid(body.employeeId)||!['confirmed','extended','not_confirmed'].includes(String(body.decision))||!calendarDate(body.effective_date)||typeof body.notes!=='string'||!body.notes.trim()||body.notes.length>2000)return NextResponse.json({error:'Choose an employee, decision, valid effective date and decision notes.'},{status:400,headers});
 if(body.decision==='extended'&&(!calendarDate(body.review_date)||body.review_date<=body.effective_date))return NextResponse.json({error:'An extension needs a review date after its effective date.'},{status:400,headers});
 const review=body.decision==='extended'?body.review_date:null,notes=body.notes.trim(),pool=db(),client=await pool.connect();
 try{
  await client.query('BEGIN');
  const person=await client.query('SELECT id,employment_status FROM workforce_employees WHERE id=$1 AND employer_id=$2 FOR UPDATE',[body.employeeId,employer]);
  if(!person.rowCount)return NextResponse.json({error:'Employee not found'},{status:404,headers});
  const prior=await client.query('SELECT id,decision,effective_date::text,review_date::text,notes FROM employee_confirmation_decisions WHERE employer_id=$1 AND employee_id=$2 ORDER BY created_at DESC,id DESC LIMIT 1',[employer,body.employeeId]);
  const last=prior.rows[0];
  if(last&&last.decision===body.decision&&last.effective_date===body.effective_date&&last.review_date===review&&last.notes===notes){await client.query('COMMIT');return NextResponse.json({ok:true,id:last.id,reused:true},{headers});}
  if(!['active','probation','on_leave'].includes(person.rows[0].employment_status))return NextResponse.json({error:'Confirmation cannot change an inactive employee. Review the employment record with HR.'},{status:409,headers});
  if(body.decision==='extended'&&person.rows[0].employment_status!=='probation')return NextResponse.json({error:'Only employees currently on probation can have probation extended.'},{status:409,headers});
  if(body.decision==='confirmed'){
   const evidence=await client.query("SELECT 1 FROM employee_performance_reviews WHERE employer_id=$1 AND employee_id=$2 AND rating IS NOT NULL AND created_at>=NOW()-INTERVAL '90 days' LIMIT 1",[employer,body.employeeId]);
   if(!evidence.rowCount)return NextResponse.json({error:'Record a rated performance review in the last 90 days before confirming this employee'},{status:422,headers});
  }
  const id=randomUUID();
  await client.query('INSERT INTO employee_confirmation_decisions(id,employer_id,employee_id,decision,effective_date,review_date,notes,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,clock_timestamp())',[id,employer,body.employeeId,body.decision,body.effective_date,review,notes]);
  await applyScheduledConfirmations(client,employer);
  await client.query(`INSERT INTO employee_notifications(id,employer_id,employee_id,title,body,source_key) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(employer_id,employee_id,source_key) WHERE source_key IS NOT NULL DO NOTHING`,[randomUUID(),employer,body.employeeId,'Staff confirmation: '+String(body.decision).replaceAll('_',' '),'Effective '+body.effective_date+'. '+notes,'confirmation-decision:'+id]);
  await client.query('COMMIT');return NextResponse.json({ok:true,id},{status:201,headers});
 }catch{return NextResponse.json({error:'Unable to save decision'},{status:503,headers});}
 finally{await client.query('ROLLBACK').catch(()=>{});client.release();await pool.end();}
}
