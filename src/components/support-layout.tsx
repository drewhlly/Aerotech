import Link from 'next/link';
import Image from 'next/image';
import {ArrowLeft} from 'lucide-react';
import {activePortal} from '@/lib/active-portal';
import {workspaceHomes} from '@/lib/portal-policy';
export default async function SupportLayout({children}:{children:React.ReactNode}){
 const role=await activePortal();
 return <div className="min-h-screen bg-[#f6f8fc]"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"><div className="flex items-center gap-3"><Image src="/brand/aerotech-logo.svg" alt="Aerotech" width={144} height={36} priority unoptimized className="h-9 w-36 object-contain"/><span className="hidden h-8 border-l border-slate-200 sm:block" aria-hidden="true"/><span className="text-sm font-medium text-slate-600">Support centre</span></div>{role&&<Link className="aero-button border border-slate-200 bg-white text-slate-800 hover:bg-slate-50" href={role==='support'?'/support-console':workspaceHomes[role]}><ArrowLeft size={16} aria-hidden="true"/> Return to my dashboard</Link>}</div></header>{children}</div>;
}
