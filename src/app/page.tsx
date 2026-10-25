import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { Logo, PublicNav } from "@/components/aerotech-portal";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      <section className="overflow-hidden bg-[#07152c]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/70">
              <Sparkles size={14} />
              The future of work
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
              One platform for your entire workforce.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
              Recruit, onboard, manage, train, track attendance, run payroll,
              stay compliant and empower your people — all from Aerotech.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/signup/employer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-6 py-4 font-black text-white"
              >
                Start with Aerotech
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/jobs"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-4 font-bold text-white"
              >
                Find a job
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl">
            <div className="rounded-2xl bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-400">
                    Employer Command Center
                  </div>
                  <div className="mt-1 text-xl font-black text-[#07152c]">
                    Your people, connected
                  </div>
                </div>
                <div className="rounded-xl bg-[#E6F7F5] p-3 text-[#2563eb]">
                  <Sparkles size={19} />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  ["People", "One directory"],
                  ["Open roles", "Your vacancies"],
                  ["Payroll", "Clear approvals"],
                  ["Compliance", "Saved records"],
                ].map(([a, b]) => (
                  <div key={a} className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xs text-slate-400">{a}</div>
                    <div className="mt-1 font-black text-[#07152c]">{b}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl bg-[#07152c] p-4 text-white">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Wallet size={16} />
                  Payroll Wallet
                </div>
                <div className="mt-2 text-2xl font-black">Payroll control</div>
                <div className="mt-1 text-xs text-white/50">
                  Ready for your next payroll run
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="solutions" className="mx-auto max-w-7xl px-5 py-20">
        <div className="max-w-2xl">
          <div className="text-sm font-black uppercase tracking-widest text-[#2563eb]">
            One workforce OS
          </div>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-[#07152c]">
            Everything your people need. Everything your business needs.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            [Users, "Workforce", "Employee 360, onboarding, documents and people management."],
            [BriefcaseBusiness, "Recruitment", "Jobs, applicants, interviews, assessments and offers."],
            [Banknote, "Payroll", "Payroll processing, statutory deductions and payslips."],
            [GraduationCap, "Training", "Courses, learning paths, certifications and L&D tracking."],
            [Clock3, "Attendance", "Attendance, shifts, leave and workforce time management."],
            [ShieldCheck, "Compliance", "Country-aware requirements, expiry tracking and reports."],
            [Wallet, "Payroll Wallet", "Review payroll statements and approvals. Wallet transactions are not enabled."],
            [Sparkles, "AI", "Intelligent HR insights and an AI workforce copilot."],
          ].map(([Icon, title, description]) => {
            const I = Icon as typeof Sparkles;
            return (
              <div
                key={title as string}
                className="rounded-2xl border border-slate-200 p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F7F5] text-[#2563eb]">
                  <I size={21} />
                </div>
                <h3 className="mt-5 font-black text-[#07152c]">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {description as string}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="payroll" className="bg-slate-50 px-5 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="text-sm font-black uppercase tracking-widest text-[#2563eb]">
              Payroll control
            </div>
            <h2 className="mt-3 text-4xl font-black text-[#07152c]">
              Fund. Approve. Pay. Reconcile.
            </h2>
            <p className="mt-5 leading-8 text-slate-500">
              Prepare payroll and review approval records in one workspace. Wallet funding is not enabled.
            </p>

            <div className="mt-7 space-y-4">
              {[
                "Employer funds payroll wallet",
                "Payroll is calculated and reviewed",
                "Statutory deductions are displayed",
                "Authorised users approve payroll",
                "Payment and reconciliation records are maintained",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="text-[#2563eb]" size={18} />
                  <span className="font-semibold text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#07152c] p-7 text-white">
            <div className="text-sm text-white/50">Payroll Wallet</div>
            <div className="mt-2 text-4xl font-black">Payroll control</div>
            <div className="mt-2 text-sm text-white/50">
              Review saved payroll records
            </div>

            <div className="mt-8 rounded-2xl bg-white/10 p-5">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Next payroll</span>
                <span>Saved payroll runs</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div className="h-2 w-full rounded-full bg-[#2563eb]" />
              </div>
              <div className="mt-2 text-xs text-white/40">
                Approval status is available in your workspace
              </div>
            </div>

            <Link
              href="/dashboard/employer/payroll/wallet"
              className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-5 py-3.5 font-black"
            >
              View payroll wallet
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section id="ai" className="mx-auto max-w-7xl px-5 py-20">
        <div className="rounded-3xl bg-[#07152c] p-8 text-white lg:p-12">
          <Sparkles className="text-[#2563eb]" size={30} />
          <h2 className="mt-5 text-4xl font-black">
            Your workforce has an AI copilot.
          </h2>
          <p className="mt-4 max-w-2xl leading-8 text-white/60">
            Ask questions about people, recruitment, attendance, training,
            payroll and compliance from one intelligent interface.
          </p>
          <Link
            href="/dashboard/employer/ai"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 font-black text-[#07152c]"
          >
            Explore Aerotech AI
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <div>© 2026 Aerotech. The operating system for modern work.</div>
        </div>
      </footer>
    </div>
  );
}
