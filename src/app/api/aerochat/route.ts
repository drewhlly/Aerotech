import {NextResponse} from 'next/server';
import {createHash,randomUUID} from 'node:crypto';
import {currentEmployer,db} from '@/lib/employer-session';
import {currentEmployee} from '@/lib/employee-auth';
export const runtime='nodejs';
const headers={'Cache-Control':'private, no-store'};
async function actor(){const employee=await currentEmployee();if(employee)return {company:employee.employer_id,id:employee.id,name:employee.first_name+' '+employee.last_name};const employer=await currentEmployer();return employer?{company:employer,id:null,name:'HR team'}:null;}
export async function GET(){
 const a=await actor();if(!a)return NextResponse.json({error:'Staff sign-in required'},{status:401,headers});
 const p=db();try{const r=await p.query('SELECT id,sender_name,body,created_at FROM (SELECT id,sender_name,body,created_at FROM aerochat_messages WHERE employer_id=$1 ORDER BY created_at DESC,id DESC LIMIT 100) recent ORDER BY created_at,id',[a.company]);return NextResponse.json({messages:r.rows},{headers});}catch{return NextResponse.json({error:'Aerochat unavailable'},{status:503,headers});}finally{await p.end();}
}
export async function POST(req:Request){
 const a=await actor();if(!a)return NextResponse.json({error:'Staff sign-in required'},{status:401,headers});
 let body:{body?:unknown;requestId?:unknown};try{body=await req.json();}catch{return NextResponse.json({error:'Invalid message'},{status:400,headers});}
 if(!body||typeof body!=='object'||Array.isArray(body)||typeof body.body!=='string'||!body.body.trim()||body.body.length>2000)return NextResponse.json({error:'Enter a message under 2,000 characters'},{status:400,headers});
 if(body.requestId!==undefined&&(typeof body.requestId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.requestId)))return NextResponse.json({error:'Invalid delivery request'},{status:400,headers});
 const text=body.body.trim();
 const digest=body.requestId?createHash('sha256').update(['aerochat-v1',a.company,a.id||'employer',body.requestId].join(':')).digest('hex').slice(0,32):null;
 const id=digest?[digest.slice(0,8),digest.slice(8,12),digest.slice(12,16),digest.slice(16,20),digest.slice(20)].join('-'):randomUUID();
 const p=db(),c=await p.connect();
 try{
  await c.query('BEGIN');await c.query('SELECT id FROM employer_accounts WHERE id=$1 FOR UPDATE',[a.company]);
  const previous=await c.query('SELECT id,sender_name,body,created_at FROM aerochat_messages WHERE id=$1 AND employer_id=$2 AND employee_id IS NOT DISTINCT FROM $3::uuid',[id,a.company,a.id]);
  if(previous.rowCount){if(previous.rows[0].body!==text)return NextResponse.json({error:'This delivery request was already used for different text.'},{status:409,headers});await c.query('COMMIT');return NextResponse.json({ok:true,message:previous.rows[0]},{status:201,headers});}
  const count=await c.query("SELECT COUNT(*)::int AS n FROM aerochat_messages WHERE employer_id=$1 AND employee_id IS NOT DISTINCT FROM $2::uuid AND created_at>NOW()-INTERVAL '1 minute'",[a.company,a.id]);
  if(count.rows[0].n>=20)return NextResponse.json({error:'Please wait before sending more messages'},{status:429,headers});
  const result=await c.query('INSERT INTO aerochat_messages(id,employer_id,employee_id,sender_name,body) VALUES($1,$2,$3,$4,$5) RETURNING id,sender_name,body,created_at',[id,a.company,a.id,a.name,text]);
  await c.query('COMMIT');return NextResponse.json({ok:true,message:result.rows[0]},{status:201,headers});
 }catch{return NextResponse.json({error:'Message could not be sent. You can retry the same message.'},{status:503,headers});}
 finally{await c.query('ROLLBACK').catch(()=>{});c.release();await p.end();}
}
