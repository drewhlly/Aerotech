"use client";

import Link from "next/link";
import WorkspaceShell from "./workspace-shell";
import BrandLogo from "./brand-logo";
import { createContext, useState, useEffect } from "react";
import {usePathname} from "next/navigation";
import {Menu,X,ChevronLeft,ChevronRight} from "lucide-react";
import {Dropdown} from '@/components/marketing-ui';

export const AEROTECH = {
  name: "Aerotech",
  tagline: "The operating system for modern work.",
  primary: "#07152c",
  accent: "#2563eb",
};

export function Logo({light=false}:{light?:boolean}){return <BrandLogo light={light}/>;}

export const PublicNavigationContext=createContext(false);
export function PublicNav() {
 const [open,setOpen]=useState(false),[submenu,setSubmenu]=useState<'insights'|'about'|null>(null);
 const path=usePathname();
 useEffect(()=>{Promise.resolve().then(()=>{setOpen(false);setSubmenu(null)})},[path]);
 useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);setSubmenu(null)}};document.addEventListener('keydown',onKey);return()=>document.removeEventListener('keydown',onKey)},[]);
 const company=[{heading:'The platform',links:[{label:'About Aerotech',href:'/about'},{label:'Solutions',href:'/solutions'}]},{heading:'Connect with us',links:[{label:'Contact',href:'/contact'},{label:'Support',href:'/support'}]}];
 const insights=[{heading:'Knowledge centre',links:[{label:'All insights',href:'/insights'},{label:'Recruitment',href:'/insights/a-more-consistent-recruitment-journey'},{label:'Attendance',href:'/insights/attendance-that-earns-trust'}]}];
 const close=()=>{setOpen(false);setSubmenu(null)};
 const mobileLink=(href:string,label:string)=><Link key={href} href={href} onClick={close} className="flex min-h-12 items-center justify-between border-b border-slate-100 py-3 text-base font-semibold text-slate-800">{label}<ChevronRight size={16} aria-hidden/></Link>;
 return <header className="sticky top-0 z-[60] border-b border-slate-200 bg-white shadow-sm">
  <div className="hidden border-b border-slate-100 bg-white lg:block"><div className="marketing-container flex min-h-9 items-center justify-end gap-6 text-xs font-semibold text-slate-600"><Link href="/careers">Search Jobs</Link><Link href="/locations">Locations</Link><Link href="/contact">Contact Us</Link><Link href="/auth/login">Login</Link></div></div>
  <div className="marketing-container flex min-h-[76px] items-center justify-between gap-4">
   {path==='/auth/login'?<Link href="/" className="inline-flex min-h-11 items-center text-sm font-semibold text-slate-700">← Home</Link>:<Logo/>}
   <nav aria-label="Public navigation" className="hidden items-center gap-8 text-sm font-semibold text-slate-800 lg:flex">
    <Link className="inline-flex min-h-11 items-center hover:text-blue-700" href="/careers">Careers</Link>
    <Link className="inline-flex min-h-11 items-center hover:text-blue-700" href="/solutions">Solutions</Link>
    <Dropdown title="Insights" groups={insights}/>
    <Dropdown title="About Us" groups={company}/>
   </nav>
   <div className="hidden items-center gap-3 lg:flex"><Link href="/auth/login" className="marketing-button marketing-button--ghost">Sign in</Link><Link href="/#choose-your-path" className="marketing-button marketing-button--secondary">Get started</Link></div>
   <button type="button" onClick={()=>{setOpen(v=>!v);setSubmenu(null)}} className="aero-button border border-slate-200 lg:hidden" aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open} aria-controls="public-mobile-menu">{open?<X size={22}/>:<Menu size={22}/>}</button>
  </div>
  {path!=='/auth/login'&&<nav aria-label="Portal sign in" className="border-t border-slate-100 bg-slate-50/95"><div className="marketing-container grid grid-cols-3 gap-2 py-2">{(['employer','employee','applicant'] as const).map(role=><Link key={role} href={'/auth/login?role='+role} className="inline-flex min-h-11 items-center justify-center rounded-lg px-2 text-center text-xs font-semibold text-blue-800 hover:bg-blue-50 sm:text-sm">{role[0].toUpperCase()+role.slice(1)} sign in</Link>)}</div></nav>}
  {open&&<><div className="fixed inset-0 z-[80] bg-slate-950/40 lg:hidden" onClick={close} aria-hidden="true"/><nav id="public-mobile-menu" aria-label="Mobile navigation" className="marketing-mobile-drawer lg:hidden">
   <div className="flex items-center justify-between border-b border-slate-200 pb-4"><span className="font-bold text-slate-900">{submenu?(submenu==='about'?'About Us':'Insights'):'Explore Aerotech'}</span><button type="button" aria-label="Close mobile menu" className="aero-button border" onClick={close}><X size={20}/></button></div>
   {submenu?<div className="mt-3"><button type="button" onClick={()=>setSubmenu(null)} className="inline-flex min-h-12 items-center gap-2 text-sm font-semibold text-blue-800"><ChevronLeft size={17}/>Back to menu</button>{(submenu==='about'?company:insights).map(g=><div className="mt-5" key={g.heading}><p className="marketing-eyebrow">{g.heading}</p>{g.links.map(l=>mobileLink(l.href,l.label))}</div>)}</div>:<div className="mt-4">
    {mobileLink('/careers','Find jobs')}
    {mobileLink('/solutions','Solutions')}
    <button type="button" className="flex w-full min-h-12 items-center justify-between border-b border-slate-100 text-left font-semibold text-slate-800" onClick={()=>setSubmenu('insights')}>Insights<ChevronRight size={17}/></button>
    <button type="button" className="flex w-full min-h-12 items-center justify-between border-b border-slate-100 text-left font-semibold text-slate-800" onClick={()=>setSubmenu('about')}>About Us<ChevronRight size={17}/></button>
    {mobileLink('/locations','Locations')}{mobileLink('/contact','Contact Us')}{mobileLink('/auth/login','Login')}
    <div className="mt-5 flex flex-col gap-2">{mobileLink('/auth/login?role=employee','Employee sign in')}{mobileLink('/auth/login?role=applicant','Applicant sign in')}{mobileLink('/auth/login?role=employer','Employer sign in')}</div>
   </div>}
  </nav></>}
 </header>;
}

export function PortalShell({children,role="employee"}:{children:React.ReactNode;role?:"employee"|"applicant"|"employer"}){return <WorkspaceShell role={role}>{children}</WorkspaceShell>}

export function StatCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-slate-500">{title}</div>
          <div className="mt-2 text-2xl font-black text-[#07152c]">{value}</div>
          <div className="mt-1 text-xs font-medium text-slate-400">{detail}</div>
        </div>
        <div className="rounded-xl bg-[#E6F7F5] p-3 text-[#2563eb]">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
