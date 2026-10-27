import Link from 'next/link';
import {redirect} from 'next/navigation';
import {currentEmployer} from '@/lib/employer-session';
import {EMPLOYER_PLANS} from '@/lib/subscriptions';
import {normalizeCountry} from '@/lib/regional-pricing';
import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata('Company checkout','Review your selected Aerotech company plan and billing availability. Create an employer account or sign in to continue with your chosen company subscription.','/pricing/checkout',false);
export default async function Page({searchParams}:{searchParams:Promise<{plan?:string;type?:string;country?:string}>}){const q=await searchParams,plan=q.plan;
 if(q.type&&q.type!=='employer'||!plan||!Object.hasOwn(EMPLOYER_PLANS,plan))return <main className="mx-auto max-w-xl px-5 py-16"><h1 className="text-3xl font-bold">Choose a valid company plan</h1><p className="my-5">This checkout link does not match an available plan.</p><Link href="/pricing" className="aero-button bg-blue-700 text-white">View plans</Link></main>;
 if(plan==='enterprise')redirect('/contact?subject=sales');
 const next='/pricing/checkout?'+new URLSearchParams({type:'employer',plan,country:normalizeCountry(q.country||'NG')});
 if(!await currentEmployer(false))redirect('/auth/signup/employer?'+new URLSearchParams({next}));
 redirect('/dashboard/employer/billing/plans?'+new URLSearchParams({plan,country:normalizeCountry(q.country||'NG')}))}
