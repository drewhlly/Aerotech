import Link from "next/link";
import {
  ArrowRight,
  MoreHorizontal,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import {
  AIAssistant,
  DashboardShell,
  PageHeader,
} from "@/components/aerotech-ui";
import { employerOSData } from "@/lib/aerotech";

export default function EmployeesPage() {
  return (
    <>
      <DashboardShell title="Employees">
        <PageHeader
          eyebrow="PEOPLE"
          title="Employees"
          description="Manage your complete workforce and Employee 360° records."
          action={
            <Link
              href="/dashboard/employer/employees/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#9D4EDD] px-4 py-2.5 text-xs font-bold text-white"
            >
              <Plus className="h-4 w-4" />
              Add employee
            </Link>
          }
        />

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 sm:max-w-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                placeholder="Search employees..."
                className="h-10 w-full bg-transparent text-xs outline-none"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {employerOSData.workforce.map((employee) => (
              <div
                key={employee.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 via-indigo-100 to-purple-100">
                    <UserRound className="h-5 w-5 text-indigo-600" />
                  </div>

                  <div>
                    <p className="text-xs font-bold">{employee.name}</p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {employee.position} · {employee.department}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {employee.id} · {employee.location}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-5 text-center">
                  <div>
                    <p className="text-[9px] text-slate-400">Attendance</p>
                    <p className="mt-1 text-xs font-bold">
                      {employee.attendance}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400">Training</p>
                    <p className="mt-1 text-xs font-bold">
                      {employee.training}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400">Performance</p>
                    <p className="mt-1 text-xs font-bold">
                      {employee.performance}/5
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                      employee.status === "Active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {employee.status}
                  </span>

                  <Link
                    href={`/dashboard/employer/employees/${employee.id}`}
                    className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <button className="rounded-xl border border-slate-200 p-2 text-slate-400">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardShell>

      <AIAssistant />
    </>
  );
}
