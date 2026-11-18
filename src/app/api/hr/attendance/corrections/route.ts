import {NextResponse} from 'next/server';
import {randomUUID} from 'node:crypto';
import {currentEmployer,db} from '@/lib/employer-session';
export const runtime='nodejs';
export async function GET(req:Request){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:'Employer access required'},{status:401});
 const eventId=new URL(req.url).searchParams.get('eventId');
 if(!eventId||!/^[0-9a-f-]{36}$/i.test(eventId))return NextResponse.json({error:'Valid eventId required'},{status:400});
 const pool=db();
 try{const r=await pool.query('SELECT id,employee_id,actor_employer_id,old_event_time,new_event_time,reason,created_at FROM attendance_event_corrections WHERE employer_id=$1 AND event_id=$2 ORDER BY created_at DESC',[employer,eventId]);return NextResponse.json({history:r.rows},{headers:{'Cache-Control':'private, no-store'}})}
 catch{return NextResponse.json({error:'Correction history unavailable'},{status:503})}finally{await pool.end()}
}
export async function POST(req:Request){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:'Employer access required'},{status:401});
 let b:unknown;try{b=await req.json()}catch{return NextResponse.json({error:'Invalid correction request'},{status:400})}
 if(!b||typeof b!=='object'||Array.isArray(b))return NextResponse.json({error:'Invalid correction request'},{status:400});
 const {eventId,newTime,reason}=b as {eventId?:unknown;newTime?:unknown;reason?:unknown};
 if(typeof eventId!=='string'||!/^[0-9a-f-]{36}$/i.test(eventId)||typeof reason!=='string'||reason.trim().length<10||reason.length>1000||typeof newTime!=='string'||!/(?:Z|[+-]\d{2}:\d{2})$/.test(newTime))
  return NextResponse.json({error:'Provide an event ID, timestamp with timezone, and correction reason (10–1000 characters).'},{status:400});
 const parsed=new Date(newTime);
 if(!Number.isFinite(parsed.getTime())||parsed.getTime()>Date.now()+3600000)return NextResponse.json({error:'Invalid or future correction timestamp'},{status:400});
 const pool=db();const client=await pool.connect();
 try{
  await client.query('BEGIN');
  const result=await client.query('SELECT id,employee_id,work_date,event_type,event_time FROM hr_attendance_events WHERE id=$1 AND employer_id=$2 FOR UPDATE',[eventId,employer]);
  if(!result.rowCount){await client.query('ROLLBACK');return NextResponse.json({error:'Attendance event not found'},{status:404})}
  const event=result.rows[0];
  // An event remains attached to its original Lagos workday (including an overnight checkout).
  const day=String(event.work_date).slice(0,10),newDay=new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Lagos',year:'numeric',month:'2-digit',day:'2-digit'}).format(parsed);
  const following=new Date(Date.parse(day+'T00:00:00Z')+86400000).toISOString().slice(0,10);
  if(newDay!==day&&!(event.event_type==='clock_out'&&newDay===following)){await client.query('ROLLBACK');return NextResponse.json({error:'Corrected time must remain on its assigned workday (or following day for overnight checkout).'},{status:422})}
  const other=await client.query('SELECT event_type,event_time FROM hr_attendance_events WHERE employer_id=$1 AND employee_id=$2 AND work_date=$3::date AND id<>$4',[employer,event.employee_id,day,eventId]);
  const first=other.rows.find((r:{event_type:string})=>r.event_type==='clock_in'),last=other.rows.find((r:{event_type:string})=>r.event_type==='clock_out');
  if(event.event_type==='clock_out'&&first&&parsed.getTime()<new Date(first.event_time).getTime()||event.event_type==='clock_in'&&last&&parsed.getTime()>new Date(last.event_time).getTime()){
   await client.query('ROLLBACK');return NextResponse.json({error:'Clock-out must be after clock-in'},{status:422});
  }
  await client.query('UPDATE hr_attendance_events SET event_time=$1 WHERE id=$2 AND employer_id=$3',[parsed.toISOString(),eventId,employer]);
  await client.query('INSERT INTO attendance_event_corrections(id,employer_id,employee_id,event_id,actor_employer_id,old_event_time,new_event_time,reason) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[randomUUID(),employer,event.employee_id,eventId,employer,event.event_time,parsed.toISOString(),reason.trim()]);
  await client.query('COMMIT');
  return NextResponse.json({ok:true,eventId,correctedTime:parsed.toISOString()});
 }catch{await client.query('ROLLBACK').catch(()=>{});return NextResponse.json({error:'Could not save audited correction'},{status:503})}
 finally{client.release();await pool.end()}
}