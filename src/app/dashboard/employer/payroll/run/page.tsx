"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Landmark,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import {
  DEMO_EMPLOYEES,
  formatCurrency,
} from "@/lib/employer-os";

const gross = DEMO_EMPLOYEES.reduce(
  (sum, employee) => sum + employee.payroll.grossSalary,
  0
);

const paye = DEMO_EMPLOYEES.reduce(
  (sum, employee) => sum + employee.payroll.employeePAYE,
  0
);

const employeePension = DEMO_EMPLOYEES.reduce(
  (sum, employee) =>
    sum + employee.payroll.employeePension,
  0
);

const employerPension = DEMO_EMPLOYEES.reduce(
  (sum, employee) =>
    sum + employee.payroll.employerPension,
  0
);

const netPay = DEMO_EMPLOYEES.reduce(
  (sum, employee) => sum + employee.payroll.netPay,
  0
);

export default function PayrollRunPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
        <Link
          href="/dashboard/employer/payroll"
          className="flex items-center gap-2 text-sm font-semibold"
        >
          <ArrowLeft size={16} />
          Payroll
        </Link>

        <div className="text-xs font-medium text-slate-500">
          Payroll run · August 2026
        </div>
      </header>

      <div className="mx-auto max-w-[1100px] space-y-6 p-5 sm:p-8">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Payroll processing
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            Review payroll before approval
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review salary, deductions, PAYE and pension before
            payroll is submitted.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Box
            title="Employees"
            value={`${DEMO_EMPLOYEES.length}`}
            icon={<WalletCards size={16} />}
          />

          <Box
            title="Gross"
            value={formatCurrency(gross)}
            icon={<WalletCards size={16} />}
          />

          <Box
            title="PAYE"
            value={formatCurrency(paye)}
            icon={<Landmark size={16} />}
          />

          <Box
            title="Pension"
            value={formatCurrency(employeePension)}
            icon={<ShieldCheck size={16} />}
          />

          <Box
            title="Net pay"
            value={formatCurrency(netPay)}
            icon={<CheckCircle2 size={16} />}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold">
              Statutory payroll review
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Nigeria payroll configuration
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            <ReviewRow
              title="PAYE deductions"
              value={formatCurrency(paye)}
              status="Ready"
            />

            <ReviewRow
              title="Employee pension"
              value={formatCurrency(employeePension)}
              status="Ready"
            />

            <ReviewRow
              title="Employer pension"
              value={formatCurrency(employerPension)}
              status="Ready"
            />

            <ReviewRow
              title="Employee bank/payment details"
              value={`${DEMO_EMPLOYEES.length} employees`}
              status="Ready"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex gap-3">
            <CircleAlert
              size={18}
              className="mt-0.5 text-amber-600"
            />

            <div>
              <div className="text-sm font-semibold text-amber-900">
                Final statutory verification required
              </div>

              <p className="mt-1 text-xs leading-5 text-amber-800">
                Aerotech should verify the applicable current
                statutory rules, thresholds, contribution rates,
                filing deadlines and employee eligibility before
                approving a production payroll.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
          <div>
            <div className="text-sm font-semibold">
              Payroll ready for approval
            </div>

            <div className="mt-1 text-xs text-slate-500">
              This action should create an immutable payroll
              snapshot in production.
            </div>
          </div>

          <button className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white">
            Approve payroll
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </main>
  );
}

function Box({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] text-slate-500">
        {icon}
        {title}
      </div>

      <div className="mt-2 text-lg font-bold">{value}</div>
    </div>
  );
}

function ReviewRow({
  title,
  value,
  status,
}: {
  title: string;
  value: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="mt-1 text-xs text-slate-400">
          {value}
        </div>
      </div>

      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">
        {status}
      </span>
    </div>
  );
}
