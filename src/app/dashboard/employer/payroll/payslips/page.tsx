"use client";

import Link from "next/link";
import { ArrowLeft, Download, FileText } from "lucide-react";

import {
  PAYROLL_EMPLOYEES,
  calculateDeductions,
  calculateGrossPay,
  calculateNetPay,
  formatPayrollAmount,
} from "@/lib/payroll";

export default function PayslipsPage() {
  const employees = PAYROLL_EMPLOYEES.filter(
    (employee) => employee.currency === "NGN"
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href="/dashboard/employer/payroll"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
        >
          <ArrowLeft size={16} />
          Back to Payroll
        </Link>

        <div className="mt-6">
          <h1 className="text-3xl font-bold text-slate-900">Payslips</h1>
          <p className="mt-2 text-sm text-slate-500">
            View and manage employee payslips for August 2026.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <FileText size={20} className="text-slate-600" />
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    {employee.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {employee.employeeId} · August 2026
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 text-right">
                <div>
                  <p className="text-xs text-slate-400">Gross</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatPayrollAmount(
                      calculateGrossPay(employee),
                      "NGN"
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Deductions</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatPayrollAmount(
                      calculateDeductions(employee),
                      "NGN"
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Net Pay</p>
                  <p className="text-sm font-bold text-slate-900">
                    {formatPayrollAmount(calculateNetPay(employee), "NGN")}
                  </p>
                </div>
              </div>

              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">
                <Download size={16} />
                Payslip
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
