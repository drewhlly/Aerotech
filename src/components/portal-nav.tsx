'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import type {LucideIcon} from 'lucide-react';
export default function PortalNav({links,close}:{links:readonly (readonly [string,string,LucideIcon])[];close:()=>void}){
  const path=usePathname();
  const active=[...links].sort((a,b)=>b[0].length-a[0].length).find(([href])=>path===href||path.startsWith(href+'/'))?.[0];
  return <nav aria-label="Workspace navigation" className="flex-1 space-y-1 overflow-y-auto p-3">{links.map(([href,label,Icon])=><Link key={href} href={href} onClick={close} aria-current={href===active?'page':undefined} className={'flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium '+(href===active?'bg-blue-600 text-white':'text-slate-300 hover:bg-white/10')}><Icon size={18}/>{label}</Link>)}</nav>;
}
