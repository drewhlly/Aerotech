"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Play, Users } from "lucide-react";
import { useMemo, useState } from "react";

import {
  PAYROLL_EMPLOYEES,
  calculateDeductions,
  calculateGrossPay,
  calculateNetPay,
  formatPayrollAmount,
} from "@/lib/payroll";

export default function PayrollRunPage() {
  const [period, setPeriod] = useState("August 2026");
  const [status, setStatus] = useState<"draft" | "generated">("draft");

  const employees = PAYROLL_EMPLOYEES.filter(
    (employee) => employee.currency === "NGN"
  );

  const totals = useMemo(() => {
    return employees.reduce(
      (result, employee) => ({
        gross: result.gross + calculateGrossPay(employee),
        deductions: result.deductions + calculateDeductions(employee),
        net: result.net + calculateNetPay(employee),
      }),
      { gross: 0, deductions: 0, net: 0 }
    );
  }, [employees]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Link
          href="/dashboard/employer/payroll"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
        >
          <ArrowLeft size={16} />
          Back to Payroll
        </Link>

        <div className="mt-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Run Payroll
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review employee compensation and generate the payroll for approval.
          </p>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Payroll Period
              </span>
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className="input"
              >
                <option>August 2026</option>
                <option>September 2026</option>
                <option>October 2026</option>
              </select>
            </label>

            <div>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Payroll Currency
              </span>
              <div className="input flex items-center bg-slate-50 text-slate-700">
                NGN — Nigerian Naira
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Summary label="Gross Pay" value={formatPayrollAmount(totals.gross, "NGN")} />
          <Summary
            label="Deductions"
            value={formatPayrollAmount(totals.deductions, "NGN")}
          />
          <Summary label="Net Pay" value={formatPayrollAmount(totals.net, "NGN")} />
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <div>
              <h2 className="font-bold text-slate-900">
                Employees Included
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {employees.length} active employees
              </p>
            </div>

            <Users size={20} className="text-slate-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Basic</th>
                  <th className="px-6 py-4">Gross</th>
                  <th className="px-6 py-4">Deductions</th>
                  <th className="px-6 py-4">Net Pay</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {employee.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {employee.employeeId} · {employee.role}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {formatPayrollAmount(employee.basicSalary, "NGN")}
                    </td>
                    <td className="px-6 py-4">
                      {formatPayrollAmount(calculateGrossPay(employee), "NGN")}
                    </td>
                    <td className="px-6 py-4">
                      {formatPayrollAmount(
                        calculateDeductions(employee),
                        "NGN"
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {formatPayrollAmount(calculateNetPay(employee), "NGN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:flex-row md:items-center">
          <div>
            {status === "generated" ? (
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={18} />
                Payroll generated successfully and ready for approval.
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Generate the payroll after reviewing all employee figures.
              </p>
            )}
          </div>

          <button
            onClick={() => setStatus("generated")}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            <Play size={16} />
            Generate Payroll
          </button>
        </div>
      </div>
    </main>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
