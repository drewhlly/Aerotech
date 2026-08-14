"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock3,
  FileText,
  Laptop,
  UserCheck,
} from "lucide-react";

import {
  getLifecycleEmployee,
  LIFECYCLE_STAGES,
} from "@/lib/lifecycle";

const categoryIcons: Record<string, React.ReactNode> = {
  documentation: <FileText size={17} />,
  it: <Laptop size={17} />,
  hr: <UserCheck size={17} />,
  training: <CheckCircle2 size={17} />,
  manager: <UsersIcon />,
  compliance: <FileText size={17} />,
};

function UsersIcon() {
  return <UserCheck size={17} />;
}

export default function EmployeeOnboardingPage() {
  const params = useParams();
  const id = String(params.id);

  const employee = getLifecycleEmployee(id);

  if (!employee) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8">
          <h1 className="text-xl font-bold text-slate-900">
            Employee not found
          </h1>

          <Link
            href="/dashboard/employer/onboarding"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600"
          >
            <ArrowLeft size={16} />
            Back to onboarding
          </Link>
        </div>
      </main>
    );
  }

  const completedTasks = employee.tasks.filter(
    (task) => task.status === "completed"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/dashboard/employer/onboarding"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Employee Lifecycle
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-xl font-bold text-indigo-600">
                {employee.employeeName
                  .split(" ")
                  .map((name) => name[0])
                  .join("")
                  .slice(0, 2)}
              </div>

              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {employee.employeeName}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {employee.jobTitle} · {employee.department}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Employee ID: {employee.employeeId}
                </p>
              </div>

            </div>

            <div className="rounded-xl bg-indigo-50 px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                Current Stage
              </p>

              <p className="mt-1 font-bold text-indigo-700">
                {employee.currentStage.replace("_", " ")}
              </p>
            </div>

          </div>

          <div className="mt-8">

            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">
                Overall Onboarding Progress
              </p>

              <p className="text-sm font-bold text-indigo-600">
                {employee.onboardingProgress}%
              </p>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600"
                style={{
                  width: `${employee.onboardingProgress}%`,
                }}
              />
            </div>

          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Start Date</p>
              <p className="mt-1 font-semibold text-slate-900">
                {employee.startDate}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Manager</p>
              <p className="mt-1 font-semibold text-slate-900">
                {employee.manager}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Location</p>
              <p className="mt-1 font-semibold text-slate-900">
                {employee.location}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">
                Probation Ends
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {employee.probationEndDate}
              </p>
            </div>

          </div>

        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-900">
              Onboarding Checklist
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {completedTasks} of {employee.tasks.length} tasks completed.
            </p>
          </div>

          <div className="divide-y divide-slate-100">

            {employee.tasks.map((task) => {

              const completed = task.status === "completed";
              const overdue = task.status === "overdue";

              return (
                <div
                  key={task.id}
                  className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                >

                  <div className="flex items-start gap-4">

                    <div
                      className={`mt-0.5 ${
                        completed
                          ? "text-emerald-600"
                          : overdue
                            ? "text-red-500"
                            : "text-slate-300"
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2 size={21} />
                      ) : (
                        <Circle size={21} />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">
                          {task.title}
                        </p>

                        {task.required && (
                          <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold uppercase text-red-600">
                            Required
                          </span>
                        )}
                      </div>

                      <p className="mt-1 max-w-2xl text-sm text-slate-500">
                        {task.description}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">

                        <span className="flex items-center gap-1">
                          {categoryIcons[task.category]}
                          {task.category}
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock3 size={14} />
                          Due {task.dueDate}
                        </span>

                        <span>
                          Assigned to {task.assignee}
                        </span>

                      </div>
                    </div>

                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                        completed
                          ? "bg-emerald-50 text-emerald-700"
                          : overdue
                            ? "bg-red-50 text-red-700"
                            : task.status === "in_progress"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {task.status.replace("_", " ")}
                    </span>
                  </div>

                </div>
              );
            })}

          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-slate-900">
            Lifecycle Progress
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Employee progression through the Aerotech employment lifecycle.
          </p>

          <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-start">

            {LIFECYCLE_STAGES.map((stage, index) => {

              const currentIndex = LIFECYCLE_STAGES.findIndex(
                (item) => item.value === employee.currentStage
              );

              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <div
                  key={stage.value}
                  className="flex flex-1 items-start gap-3"
                >

                  <div className="flex flex-col items-center">

                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                        isCompleted
                          ? "bg-emerald-600 text-white"
                          : isCurrent
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={17} />
                      ) : (
                        index + 1
                      )}
                    </div>

                  </div>

                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isCurrent
                          ? "text-indigo-700"
                          : "text-slate-700"
                      }`}
                    >
                      {stage.label}
                    </p>

                    {isCurrent && (
                      <p className="mt-1 text-xs text-indigo-500">
                        Current stage
                      </p>
                    )}
                  </div>

                </div>
              );
            })}

          </div>

        </div>

      </div>
    </main>
  );
}
