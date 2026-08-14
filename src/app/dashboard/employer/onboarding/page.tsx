"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  UserPlus,
  Users,
} from "lucide-react";

import { LIFECYCLE_EMPLOYEES } from "@/lib/lifecycle";

const stageLabels: Record<string, string> = {
  offer_accepted: "Offer Accepted",
  preboarding: "Pre-boarding",
  onboarding: "Onboarding",
  probation: "Probation",
  confirmed: "Confirmed",
  active: "Active",
  offboarding: "Offboarding",
  terminated: "Terminated",
};

export default function OnboardingPage() {
  const onboarding = LIFECYCLE_EMPLOYEES.filter(
    (employee) => employee.currentStage === "onboarding"
  );

  const probation = LIFECYCLE_EMPLOYEES.filter(
    (employee) => employee.currentStage === "probation"
  );

  const completed = LIFECYCLE_EMPLOYEES.filter(
    (employee) => employee.onboardingProgress === 100
  );

  const totalTasks = LIFECYCLE_EMPLOYEES.flatMap(
    (employee) => employee.tasks
  );

  const completedTasks = totalTasks.filter(
    (task) => task.status === "completed"
  );

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              Employee Lifecycle
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Onboarding & Lifecycle
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Manage employee onboarding, probation, confirmation and
              lifecycle activities from one central workspace.
            </p>
          </div>

          <Link
            href="/dashboard/employer/employees/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <UserPlus size={17} />
            Add Employee
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users size={20} />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Employees in Onboarding
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-900">
              {onboarding.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock3 size={20} />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              On Probation
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-900">
              {probation.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Completed Onboarding
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-900">
              {completed.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileCheck2 size={20} />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Tasks Completed
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-900">
              {completedTasks.length}/{totalTasks.length}
            </p>
          </div>

        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Employee Lifecycle
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track every employee through their employment journey.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">

            {LIFECYCLE_EMPLOYEES.map((employee) => (
              <Link
                key={employee.id}
                href={`/dashboard/employer/onboarding/${employee.id}`}
                className="group block px-6 py-5 transition hover:bg-slate-50"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-600">
                      {employee.employeeName
                        .split(" ")
                        .map((name) => name[0])
                        .join("")
                        .slice(0, 2)}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {employee.employeeName}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {employee.jobTitle} · {employee.department}
                      </p>
                    </div>

                  </div>

                  <div className="min-w-[220px]">

                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Onboarding Progress
                      </span>

                      <span className="text-xs font-bold text-slate-700">
                        {employee.onboardingProgress}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-600"
                        style={{
                          width: `${employee.onboardingProgress}%`,
                        }}
                      />
                    </div>

                  </div>

                  <div className="flex items-center gap-3">

                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                      {stageLabels[employee.currentStage]}
                    </span>

                    <ArrowRight
                      size={18}
                      className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-600"
                    />

                  </div>

                </div>
              </Link>
            ))}

          </div>
        </div>

      </div>
    </main>
  );
}
