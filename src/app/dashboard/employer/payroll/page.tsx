"use client";

import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  Users,
} from "lucide-react";

import {
  PAYROLL_EMPLOYEES,
  PAYROLL_RUNS,
  calculateDeductions,
  calculateGrossPay,
  calculateNetPay,
  formatPayrollAmount,
} from "@/lib/payroll";

export default function PayrollPage() {
  const ngEmployees = PAYROLL_EMPLOYEES.filter(
    (employee) => employee.currency === "NGN"
  );

  const gross = ngEmployees.reduce(
    (sum, employee) => sum + calculateGrossPay(employee),
    0
  );

  const deductions = ngEmployees.reduce(
    (sum, employee) => sum + calculateDeductions(employee),
    0
  );

  const net = ngEmployees.reduce(
    (sum, employee) => sum + calculateNetPay(employee),
    0
  );

  const currentRun = PAYROLL_RUNS[0];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Workforce Management
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Payroll
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage compensation, payroll runs, deductions and employee
              payslips from one place.
            </p>
          </div>

          <Link
            href="/dashboard/employer/payroll/run"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            <Plus size={17} />
            Run Payroll
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Users size={18} />}
            label="Employees on Payroll"
            value={String(ngEmployees.length)}
          />
          <StatCard
            icon={<Banknote size={18} />}
            label="Gross Payroll"
            value={formatPayrollAmount(gross, "NGN")}
          />
          <StatCard
            icon={<FileText size={18} />}
            label="Total Deductions"
            value={formatPayrollAmount(deductions, "NGN")}
          />
          <StatCard
            icon={<CheckCircle2 size={18} />}
            label="Net Payroll"
            value={formatPayrollAmount(net, "NGN")}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Current Payroll
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {currentRun.period}
                </p>
              </div>

              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                Pending Approval
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Metric label="Gross" value={formatPayrollAmount(gross, "NGN")} />
              <Metric
                label="Deductions"
                value={formatPayrollAmount(deductions, "NGN")}
              />
              <Metric label="Net Pay" value={formatPayrollAmount(net, "NGN")} />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/employer/payroll/run"
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Review Payroll
              </Link>

              <Link
                href="/dashboard/employer/payroll/payslips"
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
              >
                View Payslips
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Payroll Timeline
            </h2>

            <div className="mt-5 space-y-5">
              <TimelineItem
                icon={<Clock3 size={17} />}
                title="Payroll prepared"
                text="August 2026 payroll generated"
              />
              <TimelineItem
                icon={<CheckCircle2 size={17} />}
                title="Payroll reviewed"
                text="Awaiting employer approval"
              />
              <TimelineItem
                icon={<CalendarDays size={17} />}
                title="Payment"
                text="Payment will be initiated after approval"
              />
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recent Payroll Runs
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Track previous payroll periods.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {PAYROLL_RUNS.map((run) => (
              <div
                key={run.id}
                className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{run.period}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {run.employeeCount} employees · Created {run.createdAt}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Net Payroll</p>
                    <p className="font-bold text-slate-900">
                      {formatPayrollAmount(run.netPay, run.currency)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      run.status === "paid"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {run.status === "paid" ? "Paid" : "Pending Approval"}
                  </span>

                  <ArrowRight size={17} className="text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        {icon}
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

function TimelineItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{text}</p>
      </div>
    </div>
  );
}
