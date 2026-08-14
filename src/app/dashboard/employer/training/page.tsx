"use client";

import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Plus,
  Users,
  Award,
} from "lucide-react";
import { TRAININGS } from "@/lib/training";

const statusStyles = {
  draft: "bg-slate-100 text-slate-600",
  scheduled: "bg-blue-50 text-blue-700",
  ongoing: "bg-amber-50 text-amber-700",
  completed: "bg-emerald-50 text-emerald-700",
};

export default function TrainingPage() {
  const total = TRAININGS.length;
  const scheduled = TRAININGS.filter((t) => t.status === "scheduled").length;
  const completed = TRAININGS.filter((t) => t.status === "completed").length;
  const enrolled = TRAININGS.reduce((sum, t) => sum + t.enrolled, 0);

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="mb-1 text-sm font-medium text-blue-600">
              Learning & Development
            </p>
            <h1 className="text-3xl font-bold text-slate-900">
              Training Management
            </h1>
            <p className="mt-2 text-slate-500">
              Create, assign and track employee training from one place.
            </p>
          </div>

          <Link
            href="/dashboard/employer/training/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus size={18} />
            Create Training
          </Link>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Stat
            icon={<BookOpen size={20} />}
            label="Total Training"
            value={total}
          />
          <Stat
            icon={<CalendarDays size={20} />}
            label="Scheduled"
            value={scheduled}
          />
          <Stat
            icon={<CheckCircle2 size={20} />}
            label="Completed"
            value={completed}
          />
          <Stat
            icon={<Users size={20} />}
            label="Employees Enrolled"
            value={enrolled}
          />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <div>
              <h2 className="font-semibold text-slate-900">
                Training Programs
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage your organization's learning programs.
              </p>
            </div>

            <Award className="text-slate-300" />
          </div>

          <div className="divide-y divide-slate-100">
            {TRAININGS.map((training) => (
              <Link
                key={training.id}
                href={`/dashboard/employer/training/${training.id}`}
                className="block p-6 transition hover:bg-slate-50"
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <BookOpen size={22} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {training.title}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                            statusStyles[training.status]
                          }`}
                        >
                          {training.status}
                        </span>
                      </div>

                      <p className="mt-1 max-w-2xl text-sm text-slate-500">
                        {training.description}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={14} />
                          {training.startDate}
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock3 size={14} />
                          {training.duration}
                        </span>

                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {training.enrolled}/{training.capacity}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-sm font-semibold text-blue-600">
                    View Training →
                  </span>
                </div>
              </Link>
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
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        {icon}
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
