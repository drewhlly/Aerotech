'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import type {LucideIcon} from 'lucide-react';
type NavLink=readonly [string,string,LucideIcon];
function group(href:string){if(/\/privacy$|\/support$|\/account$|\/safeguards$/.test(href))return 'Settings & help';if(/\/meet$|\/aerochat$|\/surveys$|\/birthdays$|\/notifications$/.test(href))return 'Connect';if(/\/payroll|\/payslips|\/compliance|\/reports/.test(href))return 'Pay & reporting';if(/\/recruitment|\/opportunities|\/applications|\/assessments|\/interviews/.test(href))return 'Recruitment';if(/\/employees|\/onboarding|\/confirmations|\/attendance|\/requests|\/training|\/performance|\/documents|\/profile|\/leave|\/exits|\/automation/.test(href))return 'People & work';return 'Workspace'}
export default function PortalNav({links,close}:{links:readonly NavLink[];close:()=>void}){
 const path=usePathname();
 const active=[...links].sort((a,b)=>b[0].length-a[0].length).find(([href])=>path===href||path.startsWith(href+'/'))?.[0];
 const groups=new Map<string,NavLink[]>();for(const link of links){const name=group(link[0]);groups.set(name,[...(groups.get(name)||[]),link])}
 return <nav aria-label="Workspace navigation" className="flex-1 space-y-5 overflow-y-auto p-3">{[...groups].map(([name,items])=><section key={name} aria-label={name}><h2 className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">{name}</h2><div className="space-y-1">{items.map(([href,label,Icon])=><Link key={href} href={href} onClick={close} aria-current={href===active?'page':undefined} className={'flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium '+(href===active?'bg-blue-600 text-white':'text-slate-300 hover:bg-white/10')}><Icon size={18}/>{label}</Link>)}</div></section>)}</nav>;
}
