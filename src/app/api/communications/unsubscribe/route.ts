import {NextResponse} from 'next/server';
import {db} from '@/lib/employer-session';
export const runtime='nodejs';
export async function POST(req:Request){
 const token=new URL(req.url).searchParams.get('token')||'';
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token))return NextResponse.json({error:'Invalid unsubscribe link.'},{status:400});
 const p=db();try{
  await p.query('UPDATE communication_preferences SET job_alerts=FALSE,newsletter=FALSE,product_updates=FALSE,updated_at=NOW() WHERE unsubscribe_token=$1::uuid',[token]);
  // Same response for unknown tokens; no account identifiers or email addresses are exposed.
  return NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'Unable to update preferences. Please retry.'},{status:503})}finally{await p.end();}
}
