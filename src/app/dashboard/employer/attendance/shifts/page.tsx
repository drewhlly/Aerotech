"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Clock3,
  Plus,
  Users,
  CalendarDays,
} from "lucide-react";

const shifts = [
  {
    name: "Morning Shift",
    time: "08:00 AM – 05:00 PM",
    days: "Mon – Fri",
    employees: 64,
    break: "1 hour",
  },
  {
    name: "Evening Shift",
    time: "02:00 PM – 11:00 PM",
    days: "Mon – Fri",
    employees: 38,
    break: "1 hour",
  },
  {
    name: "Weekend Shift",
    time: "09:00 AM – 06:00 PM",
    days: "Sat – Sun",
    employees: 16,
    break: "1 hour",
  },
];

export default function ShiftsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">

        <Link
          href="/dashboard/employer/attendance"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Attendance
        </Link>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Workforce Management
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Shift Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Create work schedules and assign employees to shifts.
            </p>
          </div>

          <Link
            href="/dashboard/employer/attendance/shifts/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            <Plus size={17} />
            Create Shift
          </Link>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Stat
            icon={<Clock3 size={20} />}
            label="Active Shifts"
            value="3"
          />

          <Stat
            icon={<Users size={20} />}
            label="Assigned Employees"
            value="118"
          />

          <Stat
            icon={<CalendarDays size={20} />}
            label="Work Schedules"
            value="142"
          />
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {shifts.map((shift) => (
            <div
              key={shift.name}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-slate-100 p-3">
                  <Clock3 size={21} className="text-slate-700" />
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Active
                </span>
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                {shift.name}
              </h2>

              <p className="mt-2 text-sm font-medium text-slate-700">
                {shift.time}
              </p>

              <div className="mt-5 space-y-3 text-sm text-slate-500">
                <div className="flex justify-between">
                  <span>Working days</span>
                  <span className="font-medium text-slate-700">
                    {shift.days}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Break</span>
                  <span className="font-medium text-slate-700">
                    {shift.break}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Employees</span>
                  <span className="font-medium text-slate-700">
                    {shift.employees}
                  </span>
                </div>
              </div>

              <button className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Manage Shift
              </button>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
          {icon}
        </div>

        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
