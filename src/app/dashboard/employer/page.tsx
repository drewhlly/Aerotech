"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  XCircle,
} from "lucide-react";

import {
  employerOSData,
  formatMoney,
  getPayrollStatusClass,
  getPayrollStatusLabel,
} from "@/lib/employer-os";

const data = employerOSData;

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  trend,
  href,
}: {
  title: string;
  value: string | number;
  detail: string;
  icon: React.ElementType;
  trend?: "up" | "down";
  href?: string;
}) {
  const content = (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon size={19} />
        </div>

        {trend && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold ${
              trend === "up" ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
            {trend === "up" ? "Positive" : "Needs attention"}
          </span>
        )}
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
          {value}
        </p>
        <p className="mt-1 text-xs text-slate-500">{detail}</p>
      </div>

      {href && (
        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-700 group-hover:text-slate-950">
          View details <ChevronRight size={14} />
        </div>
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function SectionHeader({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description?: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-base font-bold text-slate-950">{title}</h2>
        {description && (
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-950"
        >
          {action ?? "View all"}
          <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}

function StatusIcon({ severity }: { severity: string }) {
  if (severity === "critical") {
    return <XCircle size={17} />;
  }

  if (severity === "warning") {
    return <AlertTriangle size={17} />;
  }

  if (severity === "success") {
    return <CheckCircle2 size={17} />;
  }

  return <Activity size={17} />;
}

export default function EmployerDashboard() {
  const payroll = data.payroll;
  const workforce = data.workforce;
  const recruitment = data.recruitment;
  const compliance = data.compliance;
  const training = data.training;

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* TOP BAR */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Sparkles size={17} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight">
                  Aerotech
                </h1>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  WORKFORCE OS
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                Employer Command Center
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50">
              <Search size={15} />
              Search
              <span className="ml-3 rounded-md border border-slate-200 px-1.5 py-0.5 text-[9px] text-slate-400">
                /
              </span>
            </button>

            <button className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <CalendarDays size={15} />
              August 2026
            </button>

            <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
              <Settings2 size={16} />
            </button>

            <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
              HR
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-5 py-6 lg:px-8">
        {/* HERO */}
        <section className="mb-7">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Employer overview
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Good morning, HR Admin.
              </h2>

              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Manage your entire workforce from one command center — from
                recruitment and onboarding to payroll, compliance, performance
                and learning.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/employer/employees"
                className="flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white shadow-sm hover:bg-slate-800"
              >
                <Plus size={15} />
                Add employee
              </Link>

              <Link
                href="/dashboard/employer/recruitment/jobs/new"
                className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <BriefcaseBusiness size={15} />
                Create job
              </Link>
            </div>
          </div>
        </section>

        {/* PRIMARY KPI ROW */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total workforce"
            value={workforce.totalEmployees}
            detail={`${workforce.activeEmployees} active employees`}
            icon={Users}
            trend="up"
            href="/dashboard/employer/employees"
          />

          <MetricCard
            title="Payroll this period"
            value={formatMoney(payroll.grossPayroll, data.currency)}
            detail={`${payroll.employeesProcessed} employees processed`}
            icon={WalletCards}
            trend="up"
            href="/dashboard/employer/payroll"
          />

          <MetricCard
            title="Open positions"
            value={recruitment.openJobs}
            detail={`${recruitment.applicants} applicants in pipeline`}
            icon={BriefcaseBusiness}
            href="/dashboard/employer/recruitment/jobs"
          />

          <MetricCard
            title="Compliance score"
            value={`${compliance.complianceRate}%`}
            detail={`${compliance.expiring + compliance.missing} items require attention`}
            icon={ShieldCheck}
            trend="up"
            href="/dashboard/employer/compliance"
          />
        </section>

        {/* WORKFORCE + PAYROLL */}
        <section className="mt-7 grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader
              title="Workforce overview"
              description="Live snapshot of your employee population"
              href="/dashboard/employer/employees"
              action="Manage workforce"
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <Users size={17} className="text-slate-500" />
                <p className="mt-4 text-xl font-bold">
                  {workforce.activeEmployees}
                </p>
                <p className="mt-1 text-xs text-slate-500">Active</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <Clock3 size={17} className="text-slate-500" />
                <p className="mt-4 text-xl font-bold">{workforce.onLeave}</p>
                <p className="mt-1 text-xs text-slate-500">On leave</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <Activity size={17} className="text-slate-500" />
                <p className="mt-4 text-xl font-bold">
                  {workforce.attendanceRate}%
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Attendance rate
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <Plus size={17} className="text-slate-500" />
                <p className="mt-4 text-xl font-bold">{workforce.newHires}</p>
                <p className="mt-1 text-xs text-slate-500">
                  New hires this month
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  Workforce health
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  Healthy
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${workforce.attendanceRate}%` }}
                />
              </div>

              <div className="mt-3 flex justify-between text-[11px] text-slate-400">
                <span>
                  Turnover:{" "}
                  <strong className="text-slate-600">
                    {workforce.turnoverRate}%
                  </strong>
                </span>

                <span>
                  Probation:{" "}
                  <strong className="text-slate-600">
                    {workforce.probation}
                  </strong>
                </span>

                <span>
                  Open roles:{" "}
                  <strong className="text-slate-600">
                    {workforce.openPositions}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader
              title="Payroll control"
              description={payroll.payrollPeriod}
              href="/dashboard/employer/payroll"
              action="Open payroll"
            />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold tracking-tight">
                  {formatMoney(payroll.netPayroll, data.currency)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Estimated employee net pay
                </p>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${getPayrollStatusClass(
                  payroll.status
                )}`}
              >
                {getPayrollStatusLabel(payroll.status)}
              </span>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Gross payroll</span>
                <span className="font-semibold">
                  {formatMoney(payroll.grossPayroll, data.currency)}
                </span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-slate-500">
                  Employee deductions
                </span>
                <span className="font-semibold">
                  {formatMoney(payroll.employeeDeductions, data.currency)}
                </span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-slate-500">
                  Employer contributions
                </span>
                <span className="font-semibold">
                  {formatMoney(payroll.employerContributions, data.currency)}
                </span>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    Pending validation
                  </span>
                  <span className="font-bold text-amber-600">
                    {payroll.employeesPending} employees
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/employer/payroll/run"
              className="mt-5 flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 text-xs font-bold text-white hover:bg-slate-800"
            >
              <CircleDollarSign size={15} />
              Continue payroll
            </Link>
          </div>
        </section>

        {/* MODULES */}
        <section className="mt-7">
          <SectionHeader
            title="Workforce operations"
            description="Everything your HR team needs in one operating layer"
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/dashboard/employer/recruitment"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <BriefcaseBusiness size={19} />
                </div>
                <ChevronRight
                  size={17}
                  className="text-slate-300 group-hover:text-slate-700"
                />
              </div>

              <h3 className="mt-5 text-sm font-bold">Recruitment</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Jobs, candidates, interviews, assessments and offers.
              </p>

              <div className="mt-4 flex gap-4 text-[11px]">
                <span>
                  <strong>{recruitment.openJobs}</strong>{" "}
                  <span className="text-slate-400">jobs</span>
                </span>
                <span>
                  <strong>{recruitment.applicants}</strong>{" "}
                  <span className="text-slate-400">applicants</span>
                </span>
              </div>
            </Link>

            <Link
              href="/dashboard/employer/attendance"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Clock3 size={19} />
                </div>
                <ChevronRight
                  size={17}
                  className="text-slate-300 group-hover:text-slate-700"
                />
              </div>

              <h3 className="mt-5 text-sm font-bold">Time & attendance</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Attendance, shifts, schedules, leave and workforce time.
              </p>

              <div className="mt-4 text-[11px]">
                <strong>{workforce.attendanceRate}%</strong>{" "}
                <span className="text-slate-400">attendance rate</span>
              </div>
            </Link>

            <Link
              href="/dashboard/employer/training"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <GraduationCap size={19} />
                </div>
                <ChevronRight
                  size={17}
                  className="text-slate-300 group-hover:text-slate-700"
                />
              </div>

              <h3 className="mt-5 text-sm font-bold">Learning & development</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Courses, assignments, certifications and training compliance.
              </p>

              <div className="mt-4 text-[11px]">
                <strong>{training.completionRate}%</strong>{" "}
                <span className="text-slate-400">completion rate</span>
              </div>
            </Link>

            <Link
              href="/dashboard/employer/performance"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Activity size={19} />
                </div>
                <ChevronRight
                  size={17}
                  className="text-slate-300 group-hover:text-slate-700"
                />
              </div>

              <h3 className="mt-5 text-sm font-bold">Performance</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Goals, reviews, KPIs, feedback and employee development.
              </p>
            </Link>

            <Link
              href="/dashboard/employer/compliance"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <ShieldCheck size={19} />
                </div>
                <ChevronRight
                  size={17}
                  className="text-slate-300 group-hover:text-slate-700"
                />
              </div>

              <h3 className="mt-5 text-sm font-bold">Compliance</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Statutory requirements, document compliance and risk tracking.
              </p>

              <div className="mt-4 text-[11px]">
                <strong>{compliance.complianceRate}%</strong>{" "}
                <span className="text-slate-400">compliant</span>
              </div>
            </Link>

            <Link
              href="/dashboard/employer/documents"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <FileCheck2 size={19} />
                </div>
                <ChevronRight
                  size={17}
                  className="text-slate-300 group-hover:text-slate-700"
                />
              </div>

              <h3 className="mt-5 text-sm font-bold">Documents</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Employee records, company documents and expiry management.
              </p>
            </Link>
          </div>
        </section>

        {/* ALERTS + QUICK ACTIONS */}
        <section className="mt-7 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader
              title="Action center"
              description="Items requiring attention from your HR team"
              href="/dashboard/employer/compliance"
              action="Open compliance"
            />

            <div className="space-y-2">
              {data.alerts.map((alert) => (
                <Link
                  key={alert.id}
                  href={alert.href ?? "#"}
                  className="group flex gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50"
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      alert.severity === "critical"
                        ? "bg-rose-50 text-rose-600"
                        : alert.severity === "warning"
                          ? "bg-amber-50 text-amber-600"
                          : alert.severity === "success"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    <StatusIcon severity={alert.severity} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-bold text-slate-800">
                        {alert.title}
                      </p>
                      <span className="shrink-0 text-[10px] text-slate-400">
                        {alert.timestamp}
                      </span>
                    </div>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      {alert.description}
                    </p>

                    {alert.action && (
                      <p className="mt-2 text-[11px] font-bold text-slate-700 group-hover:text-slate-950">
                        {alert.action} →
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader
              title="Quick actions"
              description="Common HR operations"
            />

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {data.quickActions.map((action) => {
                const icons = {
                  employee: Users,
                  job: BriefcaseBusiness,
                  payroll: WalletCards,
                  training: GraduationCap,
                  document: FileCheck2,
                  report: ClipboardCheck,
                };

                const Icon = icons[action.icon];

                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:border-slate-200 hover:bg-slate-50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Icon size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800">
                        {action.label}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-slate-500">
                        {action.description}
                      </p>
                    </div>

                    <ChevronRight
                      size={15}
                      className="text-slate-300 group-hover:text-slate-700"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* COMPLIANCE / TRAINING / RECRUITMENT */}
        <section className="mt-7 grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500">
                  Compliance
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {compliance.complianceRate}%
                </p>
              </div>

              <ShieldCheck className="text-emerald-500" size={20} />
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${compliance.complianceRate}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-sm font-bold text-emerald-600">
                  {compliance.compliant}
                </p>
                <p className="text-[10px] text-slate-400">Compliant</p>
              </div>
              <div>
                <p className="text-sm font-bold text-amber-600">
                  {compliance.expiring}
                </p>
                <p className="text-[10px] text-slate-400">Expiring</p>
              </div>
              <div>
                <p className="text-sm font-bold text-rose-600">
                  {compliance.missing + compliance.expired}
                </p>
                <p className="text-[10px] text-slate-400">Issues</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500">
                  Learning & development
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {training.completionRate}%
                </p>
              </div>

              <GraduationCap className="text-emerald-500" size={20} />
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${training.completionRate}%` }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">
                {training.enrolledEmployees} enrolled
              </span>
              <span className="font-semibold text-rose-600">
                {training.overdueTraining} overdue
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500">
                  Recruitment pipeline
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {recruitment.applicants}
                </p>
              </div>

              <BriefcaseBusiness className="text-blue-500" size={20} />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-sm font-bold">{recruitment.screening}</p>
                <p className="mt-1 text-[10px] text-slate-400">Screening</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-sm font-bold">{recruitment.interviews}</p>
                <p className="mt-1 text-[10px] text-slate-400">Interviews</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-sm font-bold">{recruitment.offers}</p>
                <p className="mt-1 text-[10px] text-slate-400">Offers</p>
              </div>
            </div>
          </div>
        </section>

        {/* GLOBAL PAYROLL NOTICE */}
        <section className="mt-7 rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <ShieldCheck size={21} />
              </div>

              <div>
                <p className="text-sm font-bold">
                  Multi-country payroll architecture
                </p>
                <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-300">
                  Aerotech is designed to calculate payroll using
                  jurisdiction-specific tax, pension, social security,
                  statutory deduction and employer contribution rules.
                  Regulations are maintained independently from the user
                  interface and should be versioned by country and effective
                  date.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/employer/payroll/settings"
              className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-slate-950 hover:bg-slate-100"
            >
              <Settings2 size={15} />
              Payroll controls
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-8 flex flex-col gap-2 border-t border-slate-200 py-6 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Aerotech Workforce OS · Employer Command Center · v1.0
          </p>

          <div className="flex gap-4">
            <span>Secure</span>
            <span>Audit-ready</span>
            <span>Multi-country ready</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
