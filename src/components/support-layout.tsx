import Link from 'next/link';
import {activePortal} from '@/lib/active-portal';
import {workspaceHomes} from '@/lib/portal-policy';
export default async function SupportLayout({children}:{children:React.ReactNode}){
 const role=await activePortal();
 return <div className="min-h-screen bg-slate-50"><header className="border-b bg-white px-6 py-5"><div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4"><span className="font-bold text-slate-900">Aerotech Support</span>{role&&<Link className="aero-button text-blue-700" href={role==='support'?'/support-console':workspaceHomes[role]}>Return to my dashboard</Link>}</div></header>{children}</div>;
}
