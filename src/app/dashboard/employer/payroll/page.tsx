"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Download,
  FileText,
  Landmark,
  MoreHorizontal,
  Play,
  ShieldCheck,
  Users,
  WalletCards,
  AlertTriangle,
  Settings2,
} from "lucide-react";

const employees = [
  {
    name: "Adekunle Johnson",
    role: "Software Engineer",
    gross: "₦850,000",
    paye: "₦91,250",
    pension: "₦68,000",
    net: "₦690,750",
    status: "Ready",
  },
  {
    name: "Sarah Williams",
    role: "HR Manager",
    gross: "₦1,200,000",
    paye: "₦146,500",
    pension: "₦96,000",
    net: "₦957,500",
    status: "Ready",
  },
  {
    name: "Michael Okafor",
    role: "Finance Manager",
    gross: "₦950,000",
    paye: "₦105,750",
    pension: "₦76,000",
    net: "₦768,250",
    status: "Exception",
  },
  {
    name: "Fatima Bello",
    role: "Operations Lead",
    gross: "₦720,000",
    paye: "₦67,850",
    pension: "₦57,600",
    net: "₦594,550",
    status: "Ready",
  },
];

export default function PayrollPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/employer"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div>
              <h1 className="text-base font-bold text-slate-950">
                Payroll
              </h1>
              <p className="text-[11px] text-slate-400">
                August 2026 payroll cycle
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 sm:flex">
              <Download className="h-4 w-4" />
              Export
            </button>

            <Link
              href="/dashboard/employer/payroll/run"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white"
            >
              <Play className="h-4 w-4" />
              Run payroll
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* CONTROL BAR */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                OPEN
              </span>

              <span className="text-xs text-slate-400">
                Pay period: 01 Aug – 31 Aug 2026
              </span>
            </div>

            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Payroll control center
            </h2>
          </div>

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
            Nigeria
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* SUMMARY */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            {
              label: "Employees",
              value: "248",
              icon: Users,
            },
            {
              label: "Gross payroll",
              value: "₦42.8M",
              icon: CircleDollarSign,
            },
            {
              label: "PAYE",
              value: "₦5.92M",
              icon: Landmark,
            },
            {
              label: "Employee pension",
              value: "₦2.51M",
              icon: ShieldCheck,
            },
            {
              label: "Employer pension",
              value: "₦3.14M",
              icon: WalletCards,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </div>

                <p className="mt-3 text-xl font-bold text-slate-950">
                  {item.value}
                </p>
              </div>
            );
          })}
        </section>

        {/* STATUTORY PANEL */}
        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-950">
                  Statutory obligations
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Amounts Aerotech has calculated for statutory remittance.
                </p>
              </div>

              <Settings2 className="h-5 w-5 text-slate-400" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">
                  PAYE
                </p>

                <p className="mt-2 text-lg font-bold">
                  ₦5,920,000
                </p>

                <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-amber-600">
                  <AlertTriangle className="h-3 w-3" />
                  Awaiting remittance
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">
                  Employee pension
                </p>

                <p className="mt-2 text-lg font-bold">
                  ₦2,510,000
                </p>

                <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Calculated
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">
                  Employer pension
                </p>

                <p className="mt-2 text-lg font-bold">
                  ₦3,140,000
                </p>

                <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Calculated
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
            <p className="text-xs text-slate-400">
              Total employer cost
            </p>

            <p className="mt-2 text-3xl font-bold">
              ₦45.94M
            </p>

            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">
                  Gross payroll
                </span>
                <span>₦42.8M</span>
              </div>

              <div className="mt-3 flex justify-between text-xs">
                <span className="text-slate-400">
                  Employer statutory costs
                </span>
                <span>₦3.14M</span>
              </div>
            </div>

            <p className="mt-5 text-[10px] leading-5 text-slate-400">
              Employer statutory costs are separate from employee deductions
              and do not reduce employee net pay.
            </p>
          </div>
        </section>

        {/* EMPLOYEE PAYROLL */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-bold text-slate-950">
                Employee payroll
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Review gross pay, PAYE, pension and net pay before approval.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-slate-200 p-2 text-slate-500">
                <FileText className="h-4 w-4" />
              </button>

              <button className="rounded-lg border border-slate-200 p-2 text-slate-500">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Employee
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Gross
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    PAYE
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Pension
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Net pay
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {employees.map((employee) => (
                  <tr key={employee.name} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {employee.name}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {employee.role}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium">
                      {employee.gross}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {employee.paye}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {employee.pension}
                    </td>

                    <td className="px-5 py-4 text-sm font-bold text-slate-900">
                      {employee.net}
                    </td>

                    <td className="px-5 py-4">
                      {employee.status === "Ready" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" />
                          Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                          <AlertTriangle className="h-3 w-3" />
                          Exception
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col justify-between gap-3 border-t border-slate-100 p-5 sm:flex-row sm:items-center">
            <p className="text-xs text-slate-500">
              Showing 4 of 248 employees
            </p>

            <Link
              href="/dashboard/employer/payroll/run"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-800"
            >
              Continue payroll review
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
