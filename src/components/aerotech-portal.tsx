"use client";

import Link from "next/link";
import WorkspaceShell from "./workspace-shell";
import BrandLogo from "./brand-logo";
import { createContext, useContext, useState, useEffect } from "react";
import {usePathname} from "next/navigation";
import {Menu,X} from "lucide-react";

export const AEROTECH = {
  name: "Aerotech",
  tagline: "The operating system for modern work.",
  primary: "#07152c",
  accent: "#2563eb",
};

export function Logo({light=false}:{light?:boolean}){return <BrandLogo light={light}/>;}

export const PublicNavigationContext=createContext(false);
export function PublicNav() {
  const [open, setOpen] = useState(false);
  const path=usePathname();
  useEffect(()=>{Promise.resolve().then(()=>setOpen(false))},[path]);
  const alreadyVisible=useContext(PublicNavigationContext);
  if(alreadyVisible)return null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Logo />

        <nav className="hidden items-center gap-7 lg:flex">
          <Link href="/careers" className="text-sm font-medium text-slate-600 hover:text-blue-700">Find jobs</Link>
          <Link href="/auth/login?role=employee" className="text-sm font-medium text-slate-600 hover:text-blue-700">For employees</Link>
          <Link href="/auth/signup/employer" className="text-sm font-medium text-slate-600 hover:text-blue-700">For companies</Link>
          <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-blue-700">Company plans</Link>
          <Link href="/support" className="text-sm font-medium text-slate-600 hover:text-blue-700">Support</Link>
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/auth/login"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Sign in
          </Link>
          <Link
            href="/#choose-your-path"
            className="rounded-xl bg-[#07152c] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#183B56]"
          >
            Choose your path
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 lg:hidden"
          aria-label={open?"Close navigation":"Open navigation"}
          aria-expanded={open} aria-controls="public-mobile-menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <nav id="sign-in" aria-label="Portal sign in" className="border-t border-slate-100 bg-slate-50/80"><div className="mx-auto grid max-w-7xl grid-cols-3 gap-2 px-4 py-2 sm:px-5">{(['employer','employee','applicant'] as const).map(role=><Link key={role} href={'/auth/login?role='+role} className="rounded-lg px-2 py-2 text-center text-xs font-semibold text-blue-700 hover:bg-blue-50 sm:text-sm">{role[0].toUpperCase()+role.slice(1)} sign in</Link>)}</div></nav>

      {open && (
        <div id="public-mobile-menu" onClick={()=>setOpen(false)} className="border-t border-slate-200 bg-white px-5 py-5 lg:hidden">
          <div className="grid gap-3">
            <Link href="/auth/signup/applicant" className="rounded-lg p-3 hover:bg-slate-50">Applicant signup</Link><Link href="/pricing" className="rounded-lg p-3 hover:bg-slate-50">Pricing</Link><Link href="/careers" className="rounded-lg p-3 hover:bg-slate-50">
              Find jobs
            </Link>
            <Link href="/solutions" className="rounded-lg p-3 hover:bg-slate-50">
              Solutions
            </Link>
            <Link href="/support" className="rounded-lg p-3 hover:bg-slate-50">Support</Link><Link href="/auth/signup/employer" className="rounded-lg p-3 hover:bg-slate-50">For companies</Link><Link href="/auth/login?role=employee" className="rounded-lg p-3 hover:bg-slate-50">Employee sign in</Link>
            <Link href="/auth/login?role=applicant" className="rounded-lg p-3 hover:bg-slate-50">Applicant sign in</Link>
            <Link href="/auth/login?role=employer" className="rounded-lg p-3 hover:bg-slate-50">Employer sign in</Link>
            <Link
              href="/#choose-your-path"
              className="rounded-xl bg-[#07152c] p-3 text-center font-bold text-white"
            >
              Choose your path
            </Link>
          </div>
        </div>
      )}
    </header>
  );
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
