import {NextResponse} from 'next/server';
import {randomUUID,createHash} from 'node:crypto';
import {currentEmployer,db} from '@/lib/employer-session';
import {calendarDate} from '@/lib/leave-requests';
export const runtime='nodejs';
const headers={'Cache-Control':'private, no-store'};
const modules={
 onboarding:{table:'employee_onboarding_tasks',fields:['title','due_date'],required:['title']},
 training:{table:'employee_training_records',fields:['title','content_url','description','due_date'],required:['title']},
 reviews:{table:'employee_performance_reviews',fields:['summary','rating','reviewer_employee_id'],required:['summary']},
 documents:{table:'employee_document_records',fields:['title','external_url','expiry_date'],required:['title']},
 notifications:{table:'employee_notifications',fields:['title','body'],required:['title','body']}
} as const;
type Module=keyof typeof modules;
const selected=(raw:string):Module|null=>Object.hasOwn(modules,raw)?raw as Module:null;
const uuid=(value:unknown):value is string=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const normal=(v:unknown)=>v instanceof Date?v.toISOString().slice(0,10):v===''||v===undefined?null:v;
export async function GET(_:Request,{params}:{params:Promise<{module:string}>}){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:'Unauthorized'},{status:401,headers});
 const workflowModule=selected((await params).module);if(!workflowModule)return NextResponse.json({error:'Unknown module'},{status:404,headers});
 const pool=db();try{const r=await pool.query(`SELECT * FROM ${modules[workflowModule].table} WHERE employer_id=$1 ORDER BY created_at DESC,id DESC LIMIT 200`,[employer]);return NextResponse.json({records:r.rows},{headers});}catch{return NextResponse.json({error:'Records unavailable'},{status:503,headers});}finally{await pool.end();}
}
export async function POST(req:Request,{params}:{params:Promise<{module:string}>}){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:'Unauthorized'},{status:401,headers});
 const workflowModule=selected((await params).module);if(!workflowModule)return NextResponse.json({error:'Unknown module'},{status:404,headers});
 let body:Record<string,unknown>;try{body=await req.json();}catch{return NextResponse.json({error:'Invalid JSON'},{status:400,headers});}
 if(!body||typeof body!=='object'||Array.isArray(body)||!uuid(body.employeeId)||body.requestId!==undefined&&!uuid(body.requestId))return NextResponse.json({error:'Choose an employee and submit a valid request.'},{status:400,headers});
 const config=modules[workflowModule],fields=[...config.fields] as string[];
 for(const key of fields){const value=body[key];if(value!=null&&typeof value!=='string'&&!(key==='rating'&&Number.isInteger(value))||typeof value==='string'&&value.length>2000)return NextResponse.json({error:'Invalid field '+key},{status:400,headers});}
 for(const key of config.required)if(!String(body[key]||'').trim())return NextResponse.json({error:key+' required'},{status:400,headers});
 for(const key of ['due_date','expiry_date'])if(body[key]&&!calendarDate(body[key]))return NextResponse.json({error:'Choose a valid calendar date.'},{status:400,headers});
 if(body.rating!=null&&(!Number.isInteger(body.rating)||Number(body.rating)<1||Number(body.rating)>5))return NextResponse.json({error:'Rating must be 1 to 5'},{status:400,headers});
 if(body.reviewer_employee_id!=null)return NextResponse.json({error:'Reviewer identity cannot be asserted by an employer form'},{status:400,headers});
 for(const key of ['content_url','external_url'])if(body[key]){try{if(new URL(String(body[key])).protocol!=='https:')throw Error();}catch{return NextResponse.json({error:'Document and learning links must use HTTPS.'},{status:400,headers});}}
 const values=fields.map(key=>normal(typeof body[key]==='string'?(body[key] as string).trim():body[key]));
 const digest=body.requestId?createHash('sha256').update(['hr-record-v1',employer,workflowModule,body.requestId].join(':')).digest('hex').slice(0,32):null;
 const id=digest?[digest.slice(0,8),digest.slice(8,12),digest.slice(12,16),digest.slice(16,20),digest.slice(20)].join('-'):randomUUID();
 const pool=db(),client=await pool.connect();try{
  await client.query('BEGIN');
  const person=await client.query('SELECT id FROM workforce_employees WHERE id=$1 AND employer_id=$2 FOR UPDATE',[body.employeeId,employer]);
  if(!person.rowCount)return NextResponse.json({error:'Employee not found'},{status:404,headers});
  const prior=body.requestId?await client.query(`SELECT * FROM ${config.table} WHERE id=$1 AND employer_id=$2`,[id,employer]):await client.query(`SELECT * FROM ${config.table} WHERE employer_id=$1 AND employee_id=$2 AND created_at>NOW()-INTERVAL '1 minute' AND ${fields.map((key,i)=>key+' IS NOT DISTINCT FROM $'+(i+3)).join(' AND ')} LIMIT 1`,[employer,body.employeeId,...values]);
  if(prior.rowCount){const row=prior.rows[0];if(row.employee_id!==body.employeeId||fields.some((key,i)=>normal(row[key])!==values[i]))return NextResponse.json({error:'This request identifier was already used for different content.'},{status:409,headers});await client.query('COMMIT');return NextResponse.json({id:row.id,reused:true},{headers});}
  const names=['id','employer_id','employee_id',...fields];
  await client.query(`INSERT INTO ${config.table}(${names.join(',')}) VALUES(${names.map((_,i)=>'$'+(i+1)).join(',')})`,[id,employer,body.employeeId,...values]);
  if(workflowModule!=='notifications')await client.query(`INSERT INTO employee_notifications(id,employer_id,employee_id,title,body,source_key) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(employer_id,employee_id,source_key) WHERE source_key IS NOT NULL DO NOTHING`,[randomUUID(),employer,body.employeeId,'New '+workflowModule+' record','HR has shared a new '+workflowModule+' record. Open your workspace to review it.','lifecycle:'+workflowModule+':'+id]);
  await client.query('COMMIT');return NextResponse.json({id},{status:201,headers});
 }catch{return NextResponse.json({error:'Could not save record'},{status:503,headers});}finally{await client.query('ROLLBACK').catch(()=>{});client.release();await pool.end();}
}
export async function PATCH(req:Request,{params}:{params:Promise<{module:string}>}){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:'HR access required'},{status:401,headers});
 if((await params).module!=='onboarding')return NextResponse.json({error:'This module does not support checklist completion.'},{status:400,headers});
 let body:Record<string,unknown>;try{body=await req.json();}catch{return NextResponse.json({error:'Invalid request'},{status:400,headers});}
 if(!body||!uuid(body.id)||body.status!=='completed')return NextResponse.json({error:'Choose a checklist task to complete.'},{status:400,headers});
 const pool=db(),client=await pool.connect();try{
  await client.query('BEGIN');const task=await client.query('SELECT id,employee_id,title,status,automation_key FROM employee_onboarding_tasks WHERE id=$1 AND employer_id=$2 FOR UPDATE',[body.id,employer]);
  if(!task.rowCount)return NextResponse.json({error:'Task not found'},{status:404,headers});
  if(task.rows[0].status==='completed'){await client.query('COMMIT');return NextResponse.json({ok:true,reused:true},{headers});}
  if(task.rows[0].automation_key)return NextResponse.json({error:'Review and approve the associated credential to complete this automated task.'},{status:422,headers});
  await client.query("UPDATE employee_onboarding_tasks SET status='completed' WHERE id=$1 AND employer_id=$2",[body.id,employer]);
  await client.query(`INSERT INTO employee_notifications(id,employer_id,employee_id,title,body,source_key) VALUES($1,$2,$3,'Onboarding task complete',$4,$5) ON CONFLICT(employer_id,employee_id,source_key) WHERE source_key IS NOT NULL DO NOTHING`,[randomUUID(),employer,task.rows[0].employee_id,'HR marked '+task.rows[0].title+' complete.','onboarding-complete:'+body.id]);
  await client.query('COMMIT');return NextResponse.json({ok:true},{headers});
 }catch{return NextResponse.json({error:'Unable to complete task'},{status:503,headers});}finally{await client.query('ROLLBACK').catch(()=>{});client.release();await pool.end();}
}
