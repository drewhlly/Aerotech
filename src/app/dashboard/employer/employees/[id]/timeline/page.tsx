"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Circle } from "lucide-react";

const events = [
  ["Jan 2026", "Annual performance review completed", "Performance"],
  ["Jan 2026", "Compensation reviewed", "Compensation"],
  ["Sep 2025", "Completed HR compliance training", "Training"],
  ["Jan 2025", "Promoted to Human Resources Manager", "Promotion"],
  ["Jan 2024", "Employment commenced", "Onboarding"],
];

export default function TimelinePage() {
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
          Employment Timeline
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          A complete history of important employee events.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-7">
            {events.map(([date, event, category]) => (
              <div key={event} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <Circle size={13} className="mt-1 fill-indigo-600 text-indigo-600" />
                  <div className="mt-2 h-full w-px bg-slate-200" />
                </div>

                <div className="pb-5">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <CalendarDays size={14} />
                    {date}
                  </div>

                  <p className="mt-1 font-semibold text-slate-900">{event}</p>

                  <span className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
