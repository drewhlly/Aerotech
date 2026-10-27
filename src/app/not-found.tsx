import Link from 'next/link';
import {activePortal} from '@/lib/active-portal';
import {workspaceHomes} from '@/lib/portal-policy';
export default async function NotFound(){const role=await activePortal(),home=role==='support'?'/support-console':role?workspaceHomes[role]:'/';return <main className="mx-auto max-w-xl space-y-5 px-6 py-20"><p className="text-sm text-blue-700">404</p><h1 className="text-3xl font-bold">Page not found</h1><p className="leading-7 text-slate-600">This address may have changed. Return to your overview to continue.</p><Link className="aero-button bg-blue-700 text-white" href={home}>{role?'Return to my dashboard':'Back to home'}</Link></main>}
