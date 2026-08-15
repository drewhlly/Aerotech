"use client";

import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronDown,
  Download,
  Filter,
  Plus,
  Search,
  Users,
} from "lucide-react";
import {
  employees,
  getEmployeeDisplayName,
  getEmployeeGrossSalary,
  workforceStats,
} from "@/lib/workforce";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  probation: "bg-amber-50 text-amber-700",
  on_leave: "bg-blue-50 text-blue-700",
  suspended: "bg-red-50 text-red-700",
  terminated: "bg-slate-100 text-slate-600",
  resigned: "bg-slate-100 text-slate-600",
  retired: "bg-purple-50 text-purple-700",
};

export default function EmployeesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Aerotech Workforce OS
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              Employees
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/employer"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
            >
              Command Center
            </Link>

            <Link
              href="/dashboard/employer/employees/new"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Add employee
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] px-6 py-7">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Total workforce", workforceStats.totalEmployees],
            ["Active", workforceStats.activeEmployees],
            ["New this month", workforceStats.newThisMonth],
            ["Payroll ready", workforceStats.payrollReady],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <Users className="h-4 w-4 text-slate-400" />
              </div>
              <p className="mt-3 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search employees..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <div className="flex gap-2">
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold">
                <Filter className="h-4 w-4" />
                Filters
              </button>

              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Employee</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Department</th>
                  <th className="px-5 py-4">Country</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Gross pay</th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>

              <tbody>
                {employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/employer/employees/${employee.id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold">
                          {employee.firstName[0]}
                          {employee.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {getEmployeeDisplayName(employee)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {employee.employeeNumber}
                          </p>
                        </div>
                      </Link>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <BriefcaseBusiness className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">{employee.jobTitle}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {employee.department}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium">
                      {employee.country}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          statusStyles[employee.employmentStatus]
                        }`}
                      >
                        {employee.employmentStatus.replace("_", " ")}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold">
                      {employee.compensation.currency}{" "}
                      {getEmployeeGrossSalary(employee).toLocaleString()}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/dashboard/employer/employees/${employee.id}`}
                        className="inline-flex items-center gap-1 text-sm font-bold text-slate-700 hover:text-slate-950"
                      >
                        View
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
