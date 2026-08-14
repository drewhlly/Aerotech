"use client";

import Link from "next/link";
import { ArrowLeft, BarChart3, CheckCircle2 } from "lucide-react";

export default function EmployeePerformancePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href="/dashboard/employer/employees/AER-EMP-001"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Employee
        </Link>

        <h1 className="text-2xl font-bold text-slate-900">
          Employee Performance
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Goals, reviews and performance development.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <Metric label="Current Rating" value="4.2 / 5" />
          <Metric label="Goals Completed" value="8 / 10" />
          <Metric label="Review Status" value="On Track" />
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <BarChart3 size={19} className="text-indigo-600" />
            <h2 className="font-bold text-slate-900">Current Goals</h2>
          </div>

          <div className="mt-5 space-y-4">
            {[
              "Complete annual HR compliance programme",
              "Improve employee onboarding completion rate",
              "Deliver quarterly training programme",
            ].map((goal) => (
              <div
                key={goal}
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-4"
              >
                <CheckCircle2 className="text-emerald-500" size={19} />
                <span className="font-medium text-slate-800">{goal}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
