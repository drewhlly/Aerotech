"use client";

import { Suspense } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function JobPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const title = searchParams.get("title") || "Untitled position";
  const department = searchParams.get("department") || "Not specified";
  const employmentType =
    searchParams.get("employmentType") || "Not specified";
  const workplace =
    searchParams.get("workplace") || "Not specified";
  const location = searchParams.get("location") || "Not specified";
  const experience =
    searchParams.get("experience") || "Not specified";
  const salary = searchParams.get("salary") || "Not specified";
  const description =
    searchParams.get("description") || "No description provided.";
  const requirements =
    searchParams.get("requirements") || "No requirements provided.";

  const formatValue = (value: string) => {
    return value
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const requirementsList = requirements
    .split("\n")
    .map((item) => item.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={18} />
          Back to edit
        </button>

        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
            <Sparkles size={14} />
            Job Preview
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Review your job posting
          </h1>

          <p className="mt-2 text-slate-500">
            Check the details below before publishing the position.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="border-b border-slate-200 pb-8">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <BriefcaseBusiness size={28} />
              </div>

              <h2 className="text-3xl font-bold text-slate-900">
                {title}
              </h2>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1.5">
                  {formatValue(employmentType)}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1.5">
                  {formatValue(workplace)}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1.5">
                  {formatValue(experience)}
                </span>
              </div>
            </div>

            <div className="space-y-8 pt-8">
              <section>
                <h3 className="text-lg font-semibold text-slate-900">
                  Job description
                </h3>

                <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                  {description}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-slate-900">
                  Requirements
                </h3>

                <ul className="mt-4 space-y-3">
                  {requirementsList.length > 0 ? (
                    requirementsList.map((requirement, index) => (
                      <li
                        key={`${requirement}-${index}`}
                        className="flex gap-3 text-sm leading-6 text-slate-600"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900" />
                        <span>{requirement}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-slate-500">
                      No requirements provided.
                    </li>
                  )}
                </ul>
              </section>
            </div>
          </section>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Position details
            </h3>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Department
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {department}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Location
                </p>

                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-800">
                  <MapPin size={16} />
                  {location}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Compensation
                </p>

                <p className="mt-1 text-sm font-medium text-slate-800">
                  {salary}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Work arrangement
                </p>

                <p className="mt-1 text-sm font-medium text-slate-800">
                  {formatValue(workplace)}
                </p>
              </div>

              <div className="border-t border-slate-200 pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <Building2 size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Your company
                    </p>
                    <p className="text-xs text-slate-500">
                      Employer profile
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.back()}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              <ArrowLeft size={17} />
              Edit Job
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard/employer")}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Continue
              <ArrowRight size={17} />
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function JobPreviewPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-sm font-medium text-slate-500">
            Loading job preview...
          </div>
        </main>
      }
    >
      <JobPreviewContent />
    </Suspense>
  );
}
