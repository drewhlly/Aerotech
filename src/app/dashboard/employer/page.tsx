"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Coins,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  WalletCards,
  XCircle,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

const navigation: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard/employer",
    icon: LayoutDashboard,
  },
  {
    label: "People",
    href: "/dashboard/employer/employees",
    icon: Users,
  },
  {
    label: "Recruitment",
    href: "/dashboard/employer/recruitment",
    icon: BriefcaseBusiness,
  },
  {
    label: "Payroll",
    href: "/dashboard/employer/payroll",
    icon: WalletCards,
  },
  {
    label: "Attendance",
    href: "/dashboard/employer/attendance",
    icon: Clock3,
  },
  {
    label: "Training",
    href: "/dashboard/employer/training",
    icon: GraduationCap,
  },
  {
    label: "Performance",
    href: "/dashboard/employer/performance",
    icon: TrendingUp,
  },
  {
    label: "Compliance",
    href: "/dashboard/employer/compliance",
    icon: ShieldCheck,
  },
];

const stats = [
  {
    title: "Total Employees",
    value: "248",
    change: "+8.2%",
    description: "vs last month",
    icon: Users,
  },
  {
    title: "Monthly Payroll",
    value: "₦42.8M",
    change: "+4.6%",
    description: "current payroll cost",
    icon: WalletCards,
  },
  {
    title: "Open Positions",
    value: "18",
    change: "+5",
    description: "active vacancies",
    icon: BriefcaseBusiness,
  },
  {
    title: "Attendance",
    value: "94.7%",
    change: "+1.8%",
    description: "this month",
    icon: CalendarDays,
  },
];

const recruitment = [
  {
    title: "Software Engineer",
    department: "Technology",
    candidates: 42,
    stage: "Interview",
  },
  {
    title: "HR Business Partner",
    department: "People",
    candidates: 28,
    stage: "Screening",
  },
  {
    title: "Finance Manager",
    department: "Finance",
    candidates: 16,
    stage: "Offer",
  },
];

const alerts = [
  {
    type: "warning",
    title: "7 documents are expiring",
    description: "Review employee compliance documents.",
    action: "Review documents",
    href: "/dashboard/employer/compliance/expiring",
  },
  {
    type: "danger",
    title: "3 payroll exceptions",
    description: "Some employee payroll records require attention.",
    action: "Review payroll",
    href: "/dashboard/employer/payroll",
  },
  {
    type: "success",
    title: "Payroll data is ready",
    description: "248 employees are included in this cycle.",
    action: "Open payroll",
    href: "/dashboard/employer/payroll",
  },
];

function StatCard({
  title,
  value,
  change,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  description: string;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-2.5">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs">
        <span className="font-semibold text-emerald-600">{change}</span>
        <span className="text-slate-400">{description}</span>
      </div>
    </div>
  );
}

function AlertIcon({ type }: { type: string }) {
  if (type === "danger") {
    return <XCircle className="h-5 w-5 text-red-600" />;
  }

  if (type === "success") {
    return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
  }

  return <AlertTriangle className="h-5 w-5 text-amber-600" />;
}

export default function EmployerDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* TOP BAR */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard/employer"
              className="flex items-center gap-2.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <div className="text-base font-bold tracking-tight">
                  Aerotech
                </div>
                <div className="hidden text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:block">
                  Workforce OS
                </div>
              </div>
            </Link>

            <div className="hidden h-8 w-px bg-slate-200 lg:block" />

            <div className="hidden items-center gap-2 text-sm lg:flex">
              <span className="font-medium text-slate-500">
                Employer
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden w-64 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">
                Search people, jobs...
              </span>
              <span className="ml-auto rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400">
                /
              </span>
            </div>

            <button className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100">
              <Bell className="h-5 w-5" />
            </button>

            <button className="hidden rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 sm:block">
              <Settings className="h-5 w-5" />
            </button>

            <div className="ml-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                AW
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold text-slate-900">
                  Admin
                </p>
                <p className="text-[10px] text-slate-400">
                  HR Administrator
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* SIDEBAR */}
        <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col p-4">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = item.href === "/dashboard/employer";

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-slate-950 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                  >
                    <Icon
                      className={`h-4.5 w-4.5 ${
                        active
                          ? "text-white"
                          : "text-slate-400 group-hover:text-slate-700"
                      }`}
                    />

                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-800">
                  Compliance health
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[92%] rounded-full bg-emerald-500" />
              </div>

              <div className="mt-2 flex justify-between text-[10px]">
                <span className="text-slate-500">92% compliant</span>
                <Link
                  href="/dashboard/employer/compliance"
                  className="font-semibold text-slate-700"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
            {/* HEADER */}
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Command Center
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Good morning, Admin
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Here's what is happening across your workforce today.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/dashboard/employer/employees"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <UserCheck className="h-4 w-4" />
                  Add employee
                </Link>

                <Link
                  href="/dashboard/employer/recruitment/jobs/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                  <BriefcaseBusiness className="h-4 w-4" />
                  Create job
                </Link>
              </div>
            </div>

            {/* STATS */}
            <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <StatCard key={stat.title} {...stat} />
              ))}
            </section>

            {/* AI INSIGHT */}
            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-slate-950 p-2.5 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-950">
                        Aerotech Intelligence
                      </h2>

                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        LIVE
                      </span>
                    </div>

                    <p className="mt-1 max-w-3xl text-sm text-slate-500">
                      Workforce costs increased 4.6% this month.
                      Recruitment demand is highest in Technology and
                      Operations. Three payroll records need review.
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard/employer/payroll"
                  className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-800"
                >
                  Review insights
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>

            {/* CONTENT GRID */}
            <div className="mt-6 grid gap-6 xl:grid-cols-3">
              {/* PAYROLL */}
              <section className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 p-5">
                  <div>
                    <h2 className="font-bold text-slate-950">
                      Payroll control
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Current payroll cycle · August 2026
                    </p>
                  </div>

                  <Link
                    href="/dashboard/employer/payroll"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Open payroll
                  </Link>
                </div>

                <div className="grid gap-4 p-5 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Coins className="h-4 w-4" />
                      Gross payroll
                    </div>

                    <p className="mt-2 text-xl font-bold text-slate-950">
                      ₦42.8M
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <ShieldCheck className="h-4 w-4" />
                      PAYE liability
                    </div>

                    <p className="mt-2 text-xl font-bold text-slate-950">
                      ₦5.92M
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <WalletCards className="h-4 w-4" />
                      Pension
                    </div>

                    <p className="mt-2 text-xl font-bold text-slate-950">
                      ₦3.14M
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-slate-700">
                        245 employees processed
                      </span>
                      <span className="text-xs text-slate-400">
                        · 3 exceptions
                      </span>
                    </div>

                    <Link
                      href="/dashboard/employer/payroll/run"
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                    >
                      Review payroll
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </section>

              {/* ALERTS */}
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 p-5">
                  <div>
                    <h2 className="font-bold text-slate-950">
                      Attention required
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Items needing action
                    </p>
                  </div>

                  <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600">
                    3
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {alerts.map((alert) => (
                    <Link
                      href={alert.href}
                      key={alert.title}
                      className="block p-4 transition hover:bg-slate-50"
                    >
                      <div className="flex gap-3">
                        <AlertIcon type={alert.type} />

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800">
                            {alert.title}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {alert.description}
                          </p>

                          <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-slate-700">
                            {alert.action}
                            <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            {/* LOWER GRID */}
            <div className="mt-6 grid gap-6 xl:grid-cols-3">
              {/* RECRUITMENT */}
              <section className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 p-5">
                  <div>
                    <h2 className="font-bold text-slate-950">
                      Recruitment pipeline
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Active hiring activity
                    </p>
                  </div>

                  <Link
                    href="/dashboard/employer/recruitment"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700"
                  >
                    View all
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  {recruitment.map((job) => (
                    <div
                      key={job.title}
                      className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {job.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {job.department} · {job.candidates} candidates
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-600">
                          {job.stage}
                        </span>

                        <Link
                          href="/dashboard/employer/recruitment"
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* WORKFORCE HEALTH */}
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-5">
                  <h2 className="font-bold text-slate-950">
                    Workforce health
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Current workforce indicators
                  </p>
                </div>

                <div className="space-y-5 p-5">
                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">
                        Attendance
                      </span>
                      <span className="font-bold text-slate-800">
                        94.7%
                      </span>
                    </div>

                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div className="h-full w-[94.7%] rounded-full bg-emerald-500" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">
                        Compliance
                      </span>
                      <span className="font-bold text-slate-800">
                        92%
                      </span>
                    </div>

                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div className="h-full w-[92%] rounded-full bg-blue-500" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">
                        Training completion
                      </span>
                      <span className="font-bold text-slate-800">
                        81%
                      </span>
                    </div>

                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div className="h-full w-[81%] rounded-full bg-violet-500" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">
                        Performance reviews
                      </span>
                      <span className="font-bold text-slate-800">
                        76%
                      </span>
                    </div>

                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div className="h-full w-[76%] rounded-full bg-amber-500" />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* QUICK ACCESS */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-950">
                    Workforce modules
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Manage your entire employee lifecycle from one place.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    label: "Employees",
                    description: "People & employee records",
                    href: "/dashboard/employer/employees",
                    icon: Users,
                  },
                  {
                    label: "Payroll",
                    description: "Salary, PAYE & pension",
                    href: "/dashboard/employer/payroll",
                    icon: WalletCards,
                  },
                  {
                    label: "Training",
                    description: "Learning & development",
                    href: "/dashboard/employer/training",
                    icon: GraduationCap,
                  },
                  {
                    label: "Compliance",
                    description: "Documents & obligations",
                    href: "/dashboard/employer/compliance",
                    icon: FileCheck2,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      href={item.href}
                      key={item.label}
                      className="group rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-slate-100 p-2">
                          <Icon className="h-4 w-4 text-slate-700" />
                        </div>

                        <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
                      </div>

                      <p className="mt-4 text-sm font-bold text-slate-900">
                        {item.label}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* FOOTER STATUS */}
            <div className="mt-6 flex flex-col justify-between gap-3 border-t border-slate-200 pt-5 text-[11px] text-slate-400 sm:flex-row">
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-emerald-500" />
                <span>Aerotech Workforce OS operational</span>
              </div>

              <div className="flex items-center gap-4">
                <span>Multi-country payroll ready</span>
                <span>·</span>
                <span>v1.0</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
