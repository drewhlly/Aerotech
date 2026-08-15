"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  Landmark,
  Lock,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Employee data",
    description: "248 employee records checked",
    complete: true,
  },
  {
    number: 2,
    title: "Salary & earnings",
    description: "Gross pay and allowances calculated",
    complete: true,
  },
  {
    number: 3,
    title: "Tax & pension",
    description: "PAYE and statutory contributions",
    complete: true,
  },
  {
    number: 4,
    title: "Review",
    description: "Resolve payroll exceptions",
    complete: false,
  },
  {
    number: 5,
    title: "Approve",
    description: "Lock and finalize payroll",
    complete: false,
  },
];

export default function PayrollRunPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/employer/payroll"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div>
            <p className="text-sm font-bold text-slate-950">
              Run payroll
            </p>
            <p className="text-[10px] text-slate-400">
              August 2026 · Nigeria
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Payroll processing
          </span>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Review & finalize payroll
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Aerotech has calculated salary, PAYE, pension and other
            configured statutory obligations for this payroll cycle.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* STEPS */}
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Processing
            </p>

            <div className="space-y-1">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={`flex gap-3 rounded-xl p-3 ${
                    step.number === 4
                      ? "bg-slate-950 text-white"
                      : ""
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      step.complete
                        ? "bg-emerald-100 text-emerald-700"
                        : step.number === 4
                          ? "bg-white/10 text-white"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {step.complete ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <span className="text-xs font-bold">
                        {step.number}
                      </span>
                    )}
                  </div>

                  <div>
                    <p
                      className={`text-xs font-bold ${
                        step.number === 4
                          ? "text-white"
                          : "text-slate-800"
                      }`}
                    >
                      {step.title}
                    </p>

                    <p
                      className={`mt-1 text-[10px] leading-4 ${
                        step.number === 4
                          ? "text-slate-400"
                          : "text-slate-400"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* MAIN */}
          <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "Employees",
                  value: "248",
                  icon: Users,
                },
                {
                  title: "Gross pay",
                  value: "₦42.8M",
                  icon: CircleDollarSign,
                },
                {
                  title: "PAYE",
                  value: "₦5.92M",
                  icon: Landmark,
                },
                {
                  title: "Pension",
                  value: "₦5.65M",
                  icon: ShieldCheck,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <Icon className="h-5 w-5 text-slate-500" />

                    <p className="mt-4 text-xs text-slate-500">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <h2 className="font-bold text-slate-950">
                  Payroll validation
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Aerotech has completed the automated checks below.
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {[
                  {
                    title: "Employee records",
                    text: "All active employees have payroll profiles.",
                  },
                  {
                    title: "Bank account validation",
                    text: "245 records passed. 3 records require attention.",
                  },
                  {
                    title: "PAYE calculation",
                    text: "Progressive tax calculation completed.",
                  },
                  {
                    title: "Pension calculation",
                    text: "Employee and employer contributions calculated.",
                  },
                  {
                    title: "Payroll period",
                    text: "01 August – 31 August 2026.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 p-5"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex gap-3">
                <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />

                <div>
                  <h3 className="text-sm font-bold text-amber-900">
                    3 payroll exceptions require attention
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    Aerotech will not allow the payroll cycle to be
                    finalized while unresolved employee payroll exceptions
                    remain.
                  </p>

                  <Link
                    href="/dashboard/employer/payroll"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-900"
                  >
                    Review exceptions
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </section>

            <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2.5">
                  <Lock className="h-5 w-5 text-slate-700" />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Final approval
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Payroll will be locked after approval.
                  </p>
                </div>
              </div>

              <button
                disabled
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-200 px-5 py-3 text-xs font-bold text-slate-400"
              >
                Resolve exceptions first
                <ChevronRight className="h-4 w-4" />
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
