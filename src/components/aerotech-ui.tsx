"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  FileText,
  GraduationCap,
  Headphones,
  LayoutDashboard,
  Menu,
  MessageCircle,
  PieChart,
  Receipt,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { AEROTECH, employerOSData, formatMoney, getAiResponse } from "@/lib/aerotech";

export function Logo({
  compact = false,
  light = false,
}: {
  compact?: boolean;
  light?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-10 w-10" aria-label="Aerotech logo">
          <defs>
            <linearGradient id="aeroLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D4FF" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#9D4EDD" />
            </linearGradient>
          </defs>
          <path
            d="M18 76 L37 24 L54 24 L44 43 L66 43 L84 17 L84 37 L74 37 L59 57 L82 57 L68 82 L51 82 L60 67 L36 67 L31 82 Z"
            fill="none"
            stroke="url(#aeroLogoGradient)"
            strokeWidth="8"
            strokeLinejoin="round"
          />
          <path
            d="M22 49 H45 M22 49 L31 40 M22 49 L31 58"
            fill="none"
            stroke="#00D4FF"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M68 18 V45 M68 18 L61 26 M68 18 L75 26"
            fill="none"
            stroke="#00D4FF"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {!compact && (
        <div>
          <div
            className={`text-lg font-extrabold tracking-[0.16em] ${
              light ? "text-white" : "text-slate-900"
            }`}
          >
            AEROTECH
          </div>
          <div className="text-[9px] font-medium tracking-wide text-slate-400">
            People. Performance. Progress.
          </div>
        </div>
      )}
    </div>
  );
}

export function BrandMark() {
  return <Logo compact />;
}

const navigation = [
  {
    title: "COMMAND CENTER",
    items: [
      { label: "Dashboard", href: "/dashboard/employer", icon: LayoutDashboard },
      { label: "AI Assistant", href: "/dashboard/employer/ai", icon: Bot },
    ],
  },
  {
    title: "PEOPLE",
    items: [
      { label: "Employees", href: "/dashboard/employer/employees", icon: Users },
      { label: "Recruitment", href: "/dashboard/employer/recruitment", icon: BriefcaseBusiness },
      { label: "Onboarding", href: "/dashboard/employer/onboarding", icon: UserRound },
      { label: "Documents", href: "/dashboard/employer/documents", icon: FileText },
    ],
  },
  {
    title: "WORKFORCE",
    items: [
      { label: "Attendance", href: "/dashboard/employer/attendance", icon: CalendarCheck2 },
      { label: "Leave", href: "/dashboard/employer/attendance/leave", icon: Clock3 },
      { label: "Shifts", href: "/dashboard/employer/attendance/shifts", icon: ClipboardCheck },
      { label: "Training", href: "/dashboard/employer/training", icon: GraduationCap },
      { label: "Performance", href: "/dashboard/employer/performance", icon: Activity },
    ],
  },
  {
    title: "COMPENSATION",
    items: [
      { label: "Payroll", href: "/dashboard/employer/payroll", icon: CircleDollarSign },
      { label: "Payroll Wallet", href: "/dashboard/employer/payroll/wallet", icon: Wallet },
      { label: "Payslips", href: "/dashboard/employer/payroll/payslips", icon: Receipt },
    ],
  },
  {
    title: "INSIGHTS",
    items: [
      { label: "Reports", href: "/dashboard/employer/compliance/reports", icon: BarChart3 },
      { label: "Analytics", href: "/dashboard/employer/compliance/reports", icon: PieChart },
      { label: "Compliance", href: "/dashboard/employer/compliance", icon: ShieldCheck },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      { label: "Payroll Settings", href: "/dashboard/employer/payroll/settings", icon: Settings },
    ],
  },
];

export function DashboardShell({
  children,
  title = "Employer Command Center",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[270px] transform border-r border-white/10 bg-[#07111f] text-white transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-5 py-5">
            <Logo light />
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-5">
            {navigation.map((section) => (
              <div key={section.title} className="mb-6">
                <div className="mb-2 px-3 text-[10px] font-bold tracking-[0.18em] text-slate-500">
                  {section.title}
                </div>

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active =
                      pathname === item.href ||
                      (item.href !== "/dashboard/employer" &&
                        pathname.startsWith(item.href));

                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href + item.label}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                          active
                            ? "bg-gradient-to-r from-[#00D4FF]/20 via-[#6366F1]/30 to-[#9D4EDD]/30 text-white shadow-lg shadow-indigo-950/20"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${
                            active ? "text-[#00D4FF]" : "text-slate-500"
                          }`}
                        />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 p-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#00D4FF] via-[#6366F1] to-[#9D4EDD]">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Enterprise Plan</p>
                  <p className="text-[10px] text-slate-500">Workforce OS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main className="min-h-screen lg:pl-[270px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                className="rounded-xl border border-slate-200 p-2 lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
                <span>Aerotech</span>
                <span>/</span>
                <span className="font-semibold text-slate-900">{title}</span>
              </div>
            </div>

            <div className="hidden w-[330px] md:block">
              <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                <Search className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-400">
                  Search anything...
                </span>
                <span className="ml-auto rounded-md bg-white px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 shadow-sm">
                  ⌘K
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/employer/ai"
                className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <Bot className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#9D4EDD]" />
              </Link>

              <button className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
                <Bell className="h-5 w-5" />
              </button>

              <div className="hidden h-8 w-px bg-slate-200 sm:block" />

              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 text-xs font-bold text-white">
                  OD
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold">Olakunle Daniels</p>
                  <p className="text-[10px] text-slate-500">HR Manager</p>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6366F1]">
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  gradient = false,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        gradient
          ? "border-indigo-200 bg-gradient-to-br from-[#00D4FF]/10 via-white to-[#9D4EDD]/10"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">{helper}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-50 to-violet-100">
          <Icon className="h-5 w-5 text-[#6366F1]" />
        </div>
      </div>
    </div>
  );
}

export function WalletCard() {
  const payroll = employerOSData.payroll;
  const coverage = Math.min(
    100,
    Math.round((payroll.walletBalance / payroll.payrollRequired) * 100)
  );

  return (
    <div className="overflow-hidden rounded-2xl bg-[#07111f] p-6 text-white shadow-xl shadow-slate-950/10">
      <div className="relative">
        <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-[#6366F1]/20 blur-3xl" />
        <div className="absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-[#00D4FF]/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">
                Payroll Wallet
              </p>
              <p className="mt-2 text-3xl font-bold">
                {formatMoney(payroll.walletBalance)}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <Wallet className="h-5 w-5 text-[#00D4FF]" />
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Payroll funding coverage</span>
              <span className="font-semibold text-white">{coverage}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#00D4FF] via-[#6366F1] to-[#9D4EDD]"
                style={{ width: `${Math.min(100, coverage)}%` }}
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] text-slate-500">Required</p>
              <p className="mt-1 text-sm font-semibold">
                {formatMoney(payroll.payrollRequired)}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] text-slate-500">Next payroll</p>
              <p className="mt-1 text-sm font-semibold">31 Aug 2026</p>
            </div>
          </div>

          <Link
            href="/dashboard/employer/payroll/wallet"
            className="mt-5 flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
          >
            Manage Payroll Wallet
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState(
    "Hi! I’m Aerotech AI. Ask me about payroll, employees, attendance, training, recruitment or compliance."
  );

  const [busy, setBusy] = useState(false);
  async function ask() {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    try {
      const response = await fetch("/api/ai/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: prompt }) });
      const data = await response.json();
      setAnswer(response.ok ? data.answer : data.error || "AI is unavailable.");
      if (response.ok) setPrompt("");
    } catch { setAnswer("Unable to reach Aerotech AI."); } finally { setBusy(false); }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-[70] w-[min(390px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="bg-[#07111f] p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00D4FF] via-[#6366F1] to-[#9D4EDD]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Aerotech AI</p>
                  <p className="text-[10px] text-slate-400">
                    Workforce Intelligence
                  </p>
                </div>
              </div>

              <button onClick={() => setOpen(false)}>
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="max-h-[340px] overflow-y-auto p-4">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              {answer}
            </div>

            <div className="mt-4 flex gap-2">
              {["Payroll", "Attendance", "Training"].map((item) => (
                <button
                  key={item}
                  onClick={() => setPrompt(item)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 p-3">
            <div className="flex gap-2">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") ask();
                }}
                placeholder="Ask Aerotech AI..."
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-indigo-300"
              />
              <button
                onClick={ask}
                disabled={busy}
                className="rounded-xl bg-gradient-to-r from-[#6366F1] to-[#9D4EDD] px-4 text-xs font-bold text-white"
              >
                Ask
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#00D4FF] via-[#6366F1] to-[#9D4EDD] text-white shadow-2xl shadow-indigo-500/30"
        aria-label="Open Aerotech AI"
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </button>
    </>
  );
}

export function PublicNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07111f]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/">
          <Logo light />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          <a href="#platform" className="text-sm text-slate-300 hover:text-white">
            Platform
          </a>
          <a href="#workforce" className="text-sm text-slate-300 hover:text-white">
            Workforce
          </a>
          <a href="#payroll" className="text-sm text-slate-300 hover:text-white">
            Payroll
          </a>
          <a href="#ai" className="text-sm text-slate-300 hover:text-white">
            AI
          </a>
          <a href="#pricing" className="text-sm text-slate-300 hover:text-white">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/5 sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup/employer"
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:bg-slate-100"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
