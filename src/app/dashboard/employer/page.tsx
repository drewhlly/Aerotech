"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CalendarCheck2,
  CircleDollarSign,
  Clock3,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import {
  AIAssistant,
  DashboardShell,
  PageHeader,
  StatCard,
  WalletCard,
} from "@/components/aerotech-ui";
import {
  employerOSData,
  formatMoney,
  getPayrollStatusClass,
  getPayrollStatusLabel,
} from "@/lib/aerotech";

export default function EmployerDashboard() {
  const data = employerOSData;

  return (
    <>
      <DashboardShell title="Employer Command Center">
        <PageHeader
          eyebrow="AEROTECH WORKFORCE OS"
          title={`Good evening, Olakunle.`}
          description="Here is your workforce command center for today."
          action={
            <div className="flex gap-2">
              <Link
                href="/dashboard/employer/ai"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm"
              >
                <Bot className="h-4 w-4 text-indigo-600" />
                Ask AI
              </Link>
              <Link
                href="/dashboard/employer/payroll/run"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#9D4EDD] px-4 py-2.5 text-xs font-bold text-white shadow-lg"
              >
                Run payroll
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total employees"
            value={String(data.overview.totalEmployees)}
            helper={`${data.overview.activeEmployees} active employees`}
            icon={Users}
          />
          <StatCard
            label="Attendance"
            value={`${data.overview.attendanceRate}%`}
            helper="This month"
            icon={CalendarCheck2}
          />
          <StatCard
            label="Training completion"
            value={`${data.overview.trainingCompletion}%`}
            helper="Across active employees"
            icon={GraduationCap}
          />
          <StatCard
            label="Payroll readiness"
            value={`${data.overview.payrollReadiness}%`}
            helper="Current payroll cycle"
            icon={CircleDollarSign}
            gradient
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold">Workforce overview</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Key workforce indicators across your organisation.
                  </p>
                </div>
                <Link
                  href="/dashboard/employer/employees"
                  className="text-xs font-bold text-indigo-600"
                >
                  View employees
                </Link>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[10px] text-slate-500">New hires</p>
                  <p className="mt-1 text-2xl font-bold">{data.overview.newHires}</p>
                  <p className="mt-1 text-[10px] text-emerald-600">
                    This month
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[10px] text-slate-500">Open jobs</p>
                  <p className="mt-1 text-2xl font-bold">{data.overview.openJobs}</p>
                  <p className="mt-1 text-[10px] text-indigo-600">
                    Recruitment pipeline
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[10px] text-slate-500">Approvals</p>
                  <p className="mt-1 text-2xl font-bold">
                    {data.overview.pendingApprovals}
                  </p>
                  <p className="mt-1 text-[10px] text-amber-600">
                    Require attention
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold">Quick actions</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Jump directly into the most common workflows.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {data.quickActions.map((action) => {
                  const icons = {
                    employee: Users,
                    job: BriefcaseBusiness,
                    payroll: CircleDollarSign,
                    training: GraduationCap,
                    attendance: Clock3,
                    ai: Bot,
                  };

                  const Icon = icons[action.type];

                  return (
                    <Link
                      key={action.id}
                      href={action.href}
                      className="group rounded-xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
                          <Icon className="h-4 w-4 text-indigo-600" />
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:text-indigo-500" />
                      </div>
                      <p className="mt-4 text-xs font-bold">{action.label}</p>
                      <p className="mt-1 text-[10px] leading-5 text-slate-500">
                        {action.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold">Recent activity</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Latest activity across your workforce.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {data.activities.map((activity) => (
                  <div
                    key={activity.title}
                    className="flex items-start gap-3 rounded-xl bg-slate-50 p-4"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                      {activity.type === "ai" ? (
                        <Sparkles className="h-4 w-4 text-purple-500" />
                      ) : activity.type === "payroll" ? (
                        <CircleDollarSign className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Activity className="h-4 w-4 text-indigo-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-bold">{activity.title}</p>
                        <span className="text-[10px] text-slate-400">
                          {activity.time}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <WalletCard />

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold">Payroll status</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {data.payroll.currentPeriod}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${getPayrollStatusClass(
                    data.payroll.status
                  )}`}
                >
                  {getPayrollStatusLabel(data.payroll.status)}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Gross payroll</span>
                  <span className="font-bold">
                    {formatMoney(data.payroll.gross)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">PAYE</span>
                  <span className="font-bold">
                    {formatMoney(data.payroll.employeeTax)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Pension</span>
                  <span className="font-bold">
                    {formatMoney(data.payroll.pension)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Employer contributions</span>
                  <span className="font-bold">
                    {formatMoney(data.payroll.employerContributions)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">Employee net pay</span>
                    <span className="font-bold text-indigo-600">
                      {formatMoney(data.payroll.net)}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard/employer/payroll"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white"
              >
                Open payroll
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-xs font-bold text-amber-900">
                    AI compliance reminder
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-amber-800">
                    Review country-specific payroll rules before approving
                    production payroll.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardShell>

      <AIAssistant />
    </>
  );
}
