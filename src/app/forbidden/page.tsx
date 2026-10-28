import Link from 'next/link';
import {activePortal} from '@/lib/active-portal';
import {workspaceHomes} from '@/lib/portal-policy';
import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata('Access restricted','This Aerotech workspace is restricted to an authorised account role. Return to your own dashboard to continue working with the information available to you.','/forbidden',false);
export default async function Page(){const role=await activePortal();return <main className="mx-auto max-w-xl space-y-5 px-6 py-20"><p>403</p><h1 className="text-3xl font-bold">Access restricted</h1><p className="leading-7 text-slate-600">Your current account cannot access this workspace.</p><Link href={role==='support'?'/support-console':role?workspaceHomes[role]:'/auth/login'} className="aero-button bg-blue-700 text-white">{role?'Return to my dashboard':'Sign in'}</Link></main>}
