import {randomUUID} from 'node:crypto';
import {NextResponse} from 'next/server';
import {superAdmin} from '@/lib/super-admin';
import {db} from '@/lib/employer-session';
import {parseAnnouncement} from '@/lib/communication-policy';
export const runtime='nodejs';
const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
export async function GET(){
 if(!await superAdmin())return reply({error:'Administrator access required.'},403);
 const p=db();try{
  const announcements=(await p.query(`SELECT n.id,n.kind,n.audience,n.title,n.body,n.scheduled_for,n.starts_at,n.cancelled_at,COUNT(d.id)::int AS queued,COUNT(d.id) FILTER(WHERE d.status='accepted')::int AS accepted,COUNT(d.id) FILTER(WHERE d.status='failed')::int AS failed FROM platform_announcements n LEFT JOIN communication_deliveries d ON d.announcement_id=n.id GROUP BY n.id ORDER BY n.created_at DESC LIMIT 50`)).rows;
  const delivery=(await p.query("SELECT status,COUNT(*)::int AS count FROM communication_deliveries GROUP BY status")).rows;
  return reply({announcements,delivery,configured:!!process.env.RESEND_API_KEY&&!!process.env.INVITATION_FROM_EMAIL});
 }catch{return reply({error:'Communications are temporarily unavailable.'},503)}finally{await p.end();}
}
export async function POST(req:Request){
 const a=await superAdmin();if(!a)return reply({error:'Administrator access required.'},403);
 let b;try{if(Number(req.headers.get('content-length'))>24000)throw Error('Request too large.');b=parseAnnouncement(await req.json())}catch(e){return reply({error:e instanceof Error?e.message:'Invalid announcement.'},400)}
 const p=db();try{const id=randomUUID();await p.query('INSERT INTO platform_announcements(id,kind,audience,title,body,scheduled_for,starts_at,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[id,b.kind,b.audience,b.title,b.body,b.scheduled_for,b.starts_at,a.id]);return reply({id},201)}catch{return reply({error:'Unable to schedule this announcement.'},503)}finally{await p.end();}
}
export async function DELETE(req:Request){
 if(!await superAdmin())return reply({error:'Administrator access required.'},403);
 const id=new URL(req.url).searchParams.get('id')||'';if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return reply({error:'Invalid announcement.'},400);
 const p=db();try{await p.query('UPDATE platform_announcements SET cancelled_at=NOW() WHERE id=$1',[id]);return reply({ok:true})}catch{return reply({error:'Unable to cancel announcement.'},503)}finally{await p.end();}
}
