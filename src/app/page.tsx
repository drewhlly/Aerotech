import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { Logo, PublicNav } from "@/components/aerotech-ui";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <PublicNav />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,212,255,.18),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(157,78,221,.18),transparent_30%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 pb-24 pt-20 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:pb-32 lg:pt-28">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 text-xs font-semibold text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              Intelligent Workforce Operating System
            </div>

            <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Your entire workforce.
              <span className="block bg-gradient-to-r from-[#00D4FF] via-[#6366F1] to-[#9D4EDD] bg-clip-text text-transparent">
                One intelligent platform.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
              Aerotech brings recruitment, onboarding, employees, attendance,
              training, performance, payroll, compliance and workforce AI into
              one connected employer experience.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/signup/employer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00D4FF] via-[#6366F1] to-[#9D4EDD] px-6 py-3.5 text-sm font-bold shadow-2xl shadow-indigo-500/20"
              >
                Start as an employer
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/5"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-500">
              {[
                "Employee 360°",
                "Payroll & Wallet",
                "Attendance",
                "Training",
                "AI Workforce Insights",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-cyan-400/20 via-indigo-500/10 to-purple-500/20 blur-3xl" />

            <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.06] p-3 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[1.5rem] bg-[#f8fafc] p-4 text-slate-900 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-2">
                    <Logo compact />
                    <div>
                      <p className="text-xs font-bold">Employer Command Center</p>
                      <p className="text-[9px] text-slate-400">August 2026</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-600">
                    SYSTEM READY
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-4">
                  {[
                    ["248", "Employees"],
                    ["96%", "Attendance"],
                    ["78%", "Training"],
                    ["94%", "Payroll ready"],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <p className="text-xl font-bold">{value}</p>
                      <p className="mt-1 text-[10px] text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl bg-[#07111f] p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500">Payroll Wallet</p>
                      <p className="mt-1 text-xl font-bold">₦18.5m</p>
                    </div>
                    <Wallet className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div className="mt-5 h-2 rounded-full bg-white/10">
                    <div className="h-full w-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500" />
                  </div>
                  <p className="mt-2 text-[9px] text-slate-500">
                    Payroll funding coverage: 100%
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-cyan-50 p-3 text-center text-[9px] font-semibold text-cyan-700">
                    AI Insights
                  </div>
                  <div className="rounded-xl bg-indigo-50 p-3 text-center text-[9px] font-semibold text-indigo-700">
                    Compliance
                  </div>
                  <div className="rounded-xl bg-purple-50 p-3 text-center text-[9px] font-semibold text-purple-700">
                    Training
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="bg-white py-24 text-slate-900">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              One operating system
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Everything employers need to run their workforce.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              [Users, "Employee 360°", "One complete employee record from hire to exit."],
              [Clock3, "Attendance", "Capture attendance through web, mobile, QR, GPS and integrations."],
              [GraduationCap, "Training", "Manage instructor-led, e-learning, compliance and certifications."],
              [CircleDollarSign, "Payroll", "Manage compensation, deductions, contributions and payslips."],
              [Wallet, "Payroll Wallet", "Fund and monitor payroll before every payroll run."],
              [ShieldCheck, "Compliance", "Track country-aware statutory obligations and audit trails."],
              [Bot, "Aerotech AI", "Ask workforce questions and surface actionable insights."],
              [Sparkles, "Automation", "Connect workflows from recruitment through payroll."],
            ].map(([Icon, title, description]) => (
              <div
                key={title as string}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 via-indigo-100 to-purple-100">
                  {Icon && <Icon className="h-5 w-5 text-indigo-600" />}
                </div>
                <h3 className="mt-5 font-bold">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {description as string}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workforce" className="border-t border-white/10 bg-[#07111f] py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                Employee 360°
              </p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Every employee has a complete digital workforce profile.
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-400">
                Recruitment, onboarding, employment information, compensation,
                attendance, leave, training, performance, documents and timeline
                all connect to the employee record.
              </p>

              <Link
                href="/auth/signup/employer"
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-cyan-300"
              >
                Build your workforce
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Attendance", "96%", "This month"],
                  ["Leave", "14", "Days remaining"],
                  ["Performance", "4.2 / 5", "Current rating"],
                  ["Training", "78%", "Completed"],
                ].map(([label, value, helper]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                  >
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-bold">{value}</p>
                    <p className="mt-1 text-[10px] text-slate-500">{helper}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="payroll" className="bg-white py-24 text-slate-900">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="rounded-3xl bg-[#07111f] p-7 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Employer Payroll Wallet</p>
                  <p className="mt-2 text-4xl font-black">₦18.5m</p>
                </div>
                <Wallet className="h-8 w-8 text-cyan-300" />
              </div>

              <div className="mt-8 space-y-3">
                {[
                  ["Payroll required", "₦12.75m"],
                  ["PAYE", "₦1.43m"],
                  ["Pension", "₦760k"],
                  ["Employer contributions", "₦1.05m"],
                  ["Employee net pay", "₦12.95m"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between border-b border-white/10 pb-3 text-sm"
                  >
                    <span className="text-slate-400">{label}</span>
                    <span className="font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                Payroll control
              </p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Fund once. Control payroll from one place.
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-500">
                The Aerotech wallet is designed to become the funding layer
                between an employer and payroll processing. Employers can see
                their balance, required payroll funding, transaction history and
                payroll readiness before approval.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  "Wallet balance",
                  "Funding transactions",
                  "Payroll readiness",
                  "Approval controls",
                  "PAYE tracking",
                  "Pension tracking",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="ai" className="bg-slate-50 py-24 text-slate-900">
        <div className="mx-auto max-w-5xl px-5 text-center lg:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00D4FF] via-[#6366F1] to-[#9D4EDD] text-white shadow-xl">
            <Bot className="h-7 w-7" />
          </div>

          <h2 className="mt-6 text-3xl font-black sm:text-4xl">
            Meet Aerotech AI.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500">
            A workforce intelligence layer designed to help HR teams understand
            people, payroll, attendance, training, recruitment and compliance.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              "Ask workforce questions",
              "Detect payroll anomalies",
              "Recommend training",
              "Summarize performance",
              "Identify attendance patterns",
              "Generate HR reports",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-white py-24 text-slate-900">
        <div className="mx-auto max-w-5xl px-5 text-center lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
            Start building
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Ready to run your workforce differently?
          </h2>

          <Link
            href="/auth/signup/employer"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#9D4EDD] px-7 py-3.5 text-sm font-bold text-white shadow-xl"
          >
            Create employer account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#07111f] py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <Logo light />
          <p className="text-xs text-slate-500">
            © 2026 Aerotech. People. Performance. Progress.
          </p>
        </div>
      </footer>
    </main>
  );
}
