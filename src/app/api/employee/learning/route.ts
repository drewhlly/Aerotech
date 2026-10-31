import {NextResponse} from 'next/server';
import {currentEmployee} from '@/lib/employee-auth';
import {db} from '@/lib/employer-session';
import {enrollWorkflows} from '@/lib/workflow-automation';
export const runtime='nodejs';
const headers={'Cache-Control':'private, no-store'};
export async function GET(){
 const employee=await currentEmployee();if(!employee)return NextResponse.json({error:'Employee sign-in required'},{status:401,headers});
 const pool=db();try{await enrollWorkflows(pool,employee.employer_id);const [training,documents,reviews]=await Promise.all(['employee_training_records','employee_document_records','employee_performance_reviews'].map(table=>pool.query(`SELECT * FROM ${table} WHERE employee_id=$1 AND employer_id=$2 ORDER BY created_at DESC LIMIT 200`,[employee.id,employee.employer_id])));return NextResponse.json({training:training.rows,documents:documents.rows,reviews:reviews.rows},{headers});}catch{return NextResponse.json({error:'Employee records unavailable'},{status:503,headers});}finally{await pool.end();}
}
export async function PATCH(req:Request){
 const employee=await currentEmployee();if(!employee)return NextResponse.json({error:'Employee sign-in required'},{status:401,headers});
 let body:Record<string,unknown>;try{body=await req.json();}catch{return NextResponse.json({error:'Invalid request'},{status:400,headers});}
 if(!body||typeof body!=='object'||Array.isArray(body)||!['training','documents'].includes(String(body.module))||typeof body.id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.id))return NextResponse.json({error:'Choose a valid record.'},{status:400,headers});
 const pool=db(),client=await pool.connect(),table=body.module==='training'?'employee_training_records':'employee_document_records';
 try{
  await client.query('BEGIN');const row=await client.query(`SELECT * FROM ${table} WHERE id=$1 AND employee_id=$2 AND employer_id=$3 FOR UPDATE`,[body.id,employee.id,employee.employer_id]);
  if(!row.rowCount)return NextResponse.json({error:'Record not found'},{status:404,headers});
  if(body.module==='training'?row.rows[0].status==='completed':!!row.rows[0].acknowledged_at){await client.query('COMMIT');return NextResponse.json({ok:true,reused:true},{headers});}
  await client.query(`UPDATE ${table} SET ${body.module==='training'?"status='completed',completed_at=NOW()":'acknowledged_at=NOW()'} WHERE id=$1 AND employer_id=$2`,[body.id,employee.employer_id]);
  if(body.module==='training')await client.query(`INSERT INTO workflow_alerts(employer_id,alert_key,title,details) VALUES($1,$2,'Learning activity completed',$3) ON CONFLICT DO NOTHING`,[employee.employer_id,'training-complete:'+body.id,employee.first_name+' '+employee.last_name+' completed '+row.rows[0].title+'. Completion is employee-reported.']);
  await client.query('COMMIT');return NextResponse.json({ok:true},{headers});
 }catch{return NextResponse.json({error:'Unable to update record'},{status:503,headers});}finally{await client.query('ROLLBACK').catch(()=>{});client.release();await pool.end();}
}
