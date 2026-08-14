"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

const requests = [
  {
    employee: "Sarah Williams",
    type: "Annual Leave",
    dates: "Aug 18 – Aug 22",
    days: 5,
    status: "Pending",
  },
  {
    employee: "Michael Brown",
    type: "Sick Leave",
    dates: "Aug 12 – Aug 13",
    days: 2,
    status: "Approved",
  },
  {
    employee: "Grace Johnson",
    type: "Annual Leave",
    dates: "Aug 25 – Aug 29",
    days: 5,
    status: "Pending",
  },
];

export default function LeavePage() {
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
              Leave Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage employee leave balances, requests and approvals.
            </p>
          </div>

          <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            Configure Leave Policy
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Stat
            icon={<CalendarDays size={20} />}
            label="Pending Requests"
            value="7"
          />
          <Stat
            icon={<CheckCircle2 size={20} />}
            label="Approved This Month"
            value="24"
          />
          <Stat
            icon={<Clock3 size={20} />}
            label="Employees On Leave"
            value="11"
          />
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h2 className="font-bold text-slate-900">Leave Requests</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {requests.map((request) => (
              <div
                key={request.employee + request.dates}
                className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {request.employee}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {request.type} · {request.dates} · {request.days} days
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    {request.status}
                  </span>

                  {request.status === "Pending" && (
                    <>
                      <button className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
                        Approve
                      </button>

                      <button className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
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
