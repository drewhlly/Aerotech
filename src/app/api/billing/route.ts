import {sameOrigin} from '@/lib/collaboration-policy';
import {NextResponse} from 'next/server';
import {randomUUID} from 'node:crypto';
import {currentEmployer,db} from '@/lib/employer-session';
import {paystack,quote,verifyOrder} from '@/lib/billing';
import {planRanks} from '@/lib/plan-access';
export const runtime='nodejs';
export async function GET(){
 const employer=await currentEmployer(false);if(!employer)return NextResponse.json({error:'Company sign-in required'},{status:401});
 const p=db();try{
  const account=(await p.query("SELECT a.company_name,a.company_email,a.country,a.subscription_required,s.plan,s.status,s.paid_until,s.pricing_version,s.employee_limit,s.capacity_enforced_from,(SELECT COUNT(*)::int FROM workforce_employees w WHERE w.employer_id=a.id AND w.employment_status IN ('active','probation','on_leave')) AS active_employees FROM employer_accounts a LEFT JOIN company_subscriptions s ON s.employer_id=a.id WHERE a.id=$1",[employer])).rows[0];
  return NextResponse.json({account,providerReady:!!process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_live_'),mode:process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_live_')?'live':'test'},{headers:{'Cache-Control':'private, no-store'}});
 }finally{await p.end()}
}
export async function POST(req:Request){
 const employer=await currentEmployer(false);if(!employer)return NextResponse.json({error:'Company sign-in required'},{status:401});
 if(!sameOrigin(req.headers.get('origin')||'',req.headers.get('host'),new URL(req.url).protocol))return NextResponse.json({error:'Invalid origin'},{status:403});
 let body;try{body=await req.json();if(!body||typeof body!=='object'||Array.isArray(body))throw Error()}catch{return NextResponse.json({error:'Invalid request'},{status:400})}
 try{
  if(body.action==='verify')return NextResponse.json(await verifyOrder(body.reference,employer));
  if(body.action!=='checkout')return NextResponse.json({error:'Choose a billing action'},{status:400});
  if(!process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_live_'))return NextResponse.json({error:'Online subscription payments are not available. Contact support for activation.'},{status:503});
  const offer=quote(body.plan,body.country||'NG'),p=db();try{
   const account=(await p.query("SELECT a.company_email,s.plan,s.status,s.paid_until,(SELECT COUNT(*)::int FROM workforce_employees w WHERE w.employer_id=a.id AND w.employment_status IN ('active','probation','on_leave')) AS active_employees FROM employer_accounts a LEFT JOIN company_subscriptions s ON s.employer_id=a.id WHERE a.id=$1",[employer])).rows[0];
   if(!account)return NextResponse.json({error:'Company account not found'},{status:404});
   if(account.active_employees>offer.employeeLimit)return NextResponse.json({error:'This plan includes '+offer.employeeLimit+' employees. Choose a larger plan or request additional capacity for your '+account.active_employees+' active employees.'},{status:409});
   if(account.status==='active'&&new Date(account.paid_until)>new Date()&&(planRanks[account.plan as keyof typeof planRanks]||0)>planRanks[offer.plan])return NextResponse.json({error:'Your current paid plan stays active until its renewal date. Choose the same plan or an upgrade.'},{status:409});
   const reference='aero-sub-'+randomUUID();
   await p.query('INSERT INTO company_payment_orders(reference,employer_id,plan,country,currency,amount_minor,provider_mode,pricing_version,employee_limit) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[reference,employer,offer.plan,offer.country,offer.currency,offer.amountMinor,'live',offer.pricingVersion,offer.employeeLimit]);
   const result=await paystack('/transaction/initialize',{email:account.company_email,amount:String(offer.amountMinor),currency:offer.currency,reference,callback_url:new URL('/dashboard/employer/billing/plans',process.env.APP_BASE_URL||req.url).href,metadata:{employer_id:employer,plan:offer.plan,pricing_version:offer.pricingVersion,employee_limit:offer.employeeLimit}});
   if(typeof result.authorization_url!=='string'||new URL(result.authorization_url).hostname!=='checkout.paystack.com'||new URL(result.authorization_url).protocol!=='https:')throw Error('Invalid checkout response');
   return NextResponse.json({url:result.authorization_url,reference,mode:'live',amountMinor:offer.amountMinor,currency:offer.currency});
  }finally{await p.end()}
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Payment unavailable'},{status:400})}
}
