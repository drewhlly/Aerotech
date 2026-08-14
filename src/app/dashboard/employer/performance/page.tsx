"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Goal,
  Plus,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

const modules = [
  {
    title: "Performance Cycles",
    description: "Create and manage employee performance review periods.",
    href: "/dashboard/employer/performance/cycles",
    icon: ClipboardCheck,
  },
  {
    title: "Goals & KPIs",
    description: "Set, track and measure employee goals and KPIs.",
    href: "/dashboard/employer/performance/goals",
    icon: Goal,
  },
  {
    title: "Performance Reviews",
    description: "Manage employee self-reviews and manager evaluations.",
    href: "/dashboard/employer/performance/reviews",
    icon: Star,
  },
  {
    title: "Improvement Plans",
    description: "Create and monitor performance improvement plans.",
    href: "/dashboard/employer/performance/improvement-plans",
    icon: TrendingUp,
  },
];

const stats = [
  {
    label: "Employees in Review",
    value: "42",
    icon: Users,
  },
  {
    label: "Goals Completed",
    value: "68%",
    icon: CheckCircle2,
  },
  {
    label: "Average Rating",
    value: "3.8/5",
    icon: Star,
  },
  {
    label: "Reviews Pending",
    value: "14",
    icon: ClipboardCheck,
  },
];

export default function PerformancePage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="mb-1 text-sm font-semibold text-blue-600">
              PEOPLE MANAGEMENT
            </p>
            <h1 className="text-3xl font-bold text-slate-900">
              Performance Management
            </h1>
            <p className="mt-2 text-slate-500">
              Manage goals, KPIs, reviews and employee development from one
              place.
            </p>
          </div>

          <Link
            href="/dashboard/employer/performance/cycles/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus size={18} />
            New Performance Cycle
          </Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Icon size={20} className="text-slate-700" />
                </div>

                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <BarChart3 size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                2026 Annual Performance Review
              </h2>
              <p className="text-sm text-slate-500">
                Current performance cycle
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Cycle Status</p>
              <p className="mt-1 font-semibold text-emerald-600">Open</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Review Period</p>
              <p className="mt-1 font-semibold text-slate-900">
                Jan 1 – Dec 31, 2026
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Employees</p>
              <p className="mt-1 font-semibold text-slate-900">42</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold text-slate-900">
            Performance Management
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {modules.map((module) => {
              const Icon = module.icon;

              return (
                <Link
                  key={module.title}
                  href={module.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                      <Icon size={21} className="text-slate-700" />
                    </div>

                    <ArrowRight
                      size={18}
                      className="text-slate-400 transition group-hover:translate-x-1"
                    />
                  </div>

                  <h3 className="font-bold text-slate-900">
                    {module.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {module.description}
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
