"use client";

import Link from "next/link";
import {
  CalendarCheck,
  Clock3,
  Users,
  Timer,
  ArrowRight,
  CalendarDays,
  ClipboardList,
} from "lucide-react";

const stats = [
  {
    label: "Present Today",
    value: "142",
    description: "Employees checked in",
    icon: CalendarCheck,
  },
  {
    label: "Absent",
    value: "8",
    description: "Requires attention",
    icon: Users,
  },
  {
    label: "Late Arrivals",
    value: "13",
    description: "Today",
    icon: Clock3,
  },
  {
    label: "Overtime",
    value: "24.5h",
    description: "Recorded this week",
    icon: Timer,
  },
];

const quickLinks = [
  {
    title: "Leave Management",
    description: "Review and manage employee leave requests.",
    href: "/dashboard/employer/attendance/leave",
    icon: CalendarDays,
  },
  {
    title: "Shift Management",
    description: "Create and manage employee work schedules.",
    href: "/dashboard/employer/attendance/shifts",
    icon: Clock3,
  },
  {
    title: "Overtime",
    description: "Track overtime hours and approvals.",
    href: "/dashboard/employer/attendance/overtime",
    icon: Timer,
  },
  {
    title: "Attendance Reports",
    description: "View attendance trends and workforce reports.",
    href: "/dashboard/employer/attendance/reports",
    icon: ClipboardList,
  },
];

export default function AttendancePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-600">
            Workforce Management
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Attendance & Time
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage employee attendance, working hours, leave, shifts and
            overtime from one place.
          </p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-slate-100 p-3">
                    <Icon size={20} className="text-slate-700" />
                  </div>
                </div>

                <p className="mt-5 text-sm font-medium text-slate-500">
                  {stat.label}
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              Attendance Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Today's workforce attendance activity.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Clock In</th>
                  <th className="px-4 py-3">Clock Out</th>
                  <th className="px-4 py-3">Hours</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {[
                  ["John Smith", "Operations", "08:02", "17:06", "8.9h", "Present"],
                  ["Sarah Williams", "HR", "08:31", "17:00", "8.5h", "Late"],
                  ["Michael Brown", "Finance", "07:55", "17:04", "9.1h", "Present"],
                  ["Grace Johnson", "Marketing", "—", "—", "0h", "Absent"],
                ].map((row) => (
                  <tr key={row[0]} className="hover:bg-slate-50">
                    {row.map((cell) => (
                      <td key={cell} className="px-4 py-4 text-slate-700">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Time Management
            </h2>

            <p className="text-sm text-slate-500">
              Manage the different parts of your workforce time system.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="rounded-xl bg-slate-100 p-3">
                      <Icon size={21} className="text-slate-700" />
                    </div>

                    <ArrowRight
                      size={18}
                      className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
                    />
                  </div>

                  <h3 className="mt-5 font-semibold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
