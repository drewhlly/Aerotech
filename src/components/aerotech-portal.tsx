"use client";

import Link from "next/link";
import WorkspaceShell from "./workspace-shell";
import BrandLogo from "./brand-logo";
import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Wallet,
  X,
  Banknote,
  ClipboardCheck,
  HeartHandshake,
  LogOut,
} from "lucide-react";

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
  const alreadyVisible=useContext(PublicNavigationContext);
  if(alreadyVisible)return null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Logo />

        <nav className="hidden items-center gap-7 lg:flex">
          <Link href="/auth/signup/applicant" className="text-sm font-medium text-slate-600 hover:text-[#07152c]">Applicant signup</Link><Link href="/jobs" className="text-sm font-medium text-slate-600 hover:text-[#07152c]">
            Find Jobs
          </Link>
          <Link href="/solutions" className="text-sm font-medium text-slate-600 hover:text-[#07152c]">
            Solutions
          </Link>
          <Link href="/#payroll" className="text-sm font-medium text-slate-600 hover:text-[#07152c]">
            Payroll
          </Link>
          <Link href="/#training" className="text-sm font-medium text-slate-600 hover:text-[#07152c]">
            Training
          </Link>
          <Link href="/#ai" className="text-sm font-medium text-slate-600 hover:text-[#07152c]">
            AI
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-[#07152c]">
            Pricing
          </Link>
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/auth/login"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup/employer"
            className="rounded-xl bg-[#07152c] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#183B56]"
          >
            Start with Aerotech
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 lg:hidden"
          aria-label="Open navigation"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-5 py-5 lg:hidden">
          <div className="grid gap-3">
            <Link href="/auth/signup/applicant" className="rounded-lg p-3 hover:bg-slate-50">Applicant signup</Link><Link href="/pricing" className="rounded-lg p-3 hover:bg-slate-50">Pricing</Link><Link href="/jobs" className="rounded-lg p-3 hover:bg-slate-50">
              Find Jobs
            </Link>
            <Link href="/solutions" className="rounded-lg p-3 hover:bg-slate-50">
              Solutions
            </Link>
            <Link href="/#payroll" className="rounded-lg p-3 hover:bg-slate-50">
              Payroll
            </Link>
            <Link href="/auth/login" className="rounded-lg p-3 hover:bg-slate-50">
              Sign in
            </Link>
            <Link
              href="/auth/signup/employer"
              className="rounded-xl bg-[#07152c] p-3 text-center font-bold text-white"
            >
              Start with Aerotech
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

