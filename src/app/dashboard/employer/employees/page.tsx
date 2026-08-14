"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  Search,
  UserPlus,
  Users,
  WalletCards,
} from "lucide-react";
import { useMemo, useState } from "react";
import { EMPLOYEES } from "@/lib/employees";

export default function EmployeesPage() {
  const [search, setSearch] = useState("");

  const filteredEmployees = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return EMPLOYEES;
    }

    return EMPLOYEES.filter((employee) =>
      [
        employee.firstName,
        employee.lastName,
        employee.email,
        employee.department,
        employee.position,
        employee.employeeNumber,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [search]);

  const activeEmployees = EMPLOYEES.filter(
    (employee) => employee.employmentStatus === "active"
  ).length;

  const probationEmployees = EMPLOYEES.filter(
    (employee) => employee.employmentStatus === "probation"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/dashboard/employer"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Back to dashboard
            </Link>

            <h1 className="text-2xl font-bold tracking-tight">
              Employee Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your workforce from one central platform.
            </p>
          </div>

          <Link
            href="/dashboard/employer/employees/new"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <UserPlus size={18} />
            Add Employee
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-5 md:grid-cols-3">
          <StatCard
            icon={<Users size={20} />}
            label="Total Employees"
            value={EMPLOYEES.length}
          />

          <StatCard
            icon={<BriefcaseBusiness size={20} />}
            label="Active Employees"
            value={activeEmployees}
          />

          <StatCard
            icon={<CalendarDays size={20} />}
            label="On Probation"
            value={probationEmployees}
          />
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold">Employee Directory</h2>
              <p className="mt-1 text-sm text-slate-500">
                View and manage every employee in your organisation.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employees..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Employee</th>
                  <th className="px-5 py-4 font-semibold">Department</th>
                  <th className="px-5 py-4 font-semibold">Position</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Joined</th>
                  <th className="px-5 py-4 font-semibold"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/employer/employees/${employee.id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700">
                          {employee.firstName[0]}
                          {employee.lastName[0]}
                        </div>

                        <div>
                          <p className="font-semibold hover:underline">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {employee.employeeNumber}
                          </p>
                        </div>
                      </Link>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-slate-400" />
                        {employee.department}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {employee.position}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={employee.employmentStatus} />
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {new Date(employee.dateJoined).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/dashboard/employer/employees/${employee.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-950"
                      >
                        View
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredEmployees.length === 0 && (
              <div className="px-6 py-16 text-center">
                <Users className="mx-auto text-slate-300" size={36} />
                <p className="mt-3 font-semibold">No employees found</p>
                <p className="mt-1 text-sm text-slate-500">
                  Try a different search term.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-4">
          <QuickModule
            icon={<GraduationCap size={20} />}
            title="Training"
            text="Manage employee learning and development."
          />

          <QuickModule
            icon={<WalletCards size={20} />}
            title="Payroll"
            text="Manage salaries, deductions and payslips."
          />

          <QuickModule
            icon={<CalendarDays size={20} />}
            title="Leave & Attendance"
            text="Track attendance and employee leave."
          />

          <QuickModule
            icon={<BriefcaseBusiness size={20} />}
            title="Performance"
            text="Manage goals, KPIs and appraisals."
          />
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
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "active" | "probation" | "on_leave" | "suspended" | "terminated";
}) {
  const labels = {
    active: "Active",
    probation: "Probation",
    on_leave: "On Leave",
    suspended: "Suspended",
    terminated: "Terminated",
  };

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
      {labels[status]}
    </span>
  );
}

function QuickModule({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-400">
        Coming next
        <ArrowRight size={14} />
      </div>
    </div>
  );
}
