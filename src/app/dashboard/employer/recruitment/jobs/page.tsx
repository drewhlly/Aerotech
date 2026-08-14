"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Plus } from "lucide-react";
import { RECRUITMENT_JOBS } from "@/lib/recruitment-workflow";

export default function RecruitmentJobsPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/dashboard/employer/recruitment"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
        >
          <ArrowLeft size={16} />
          Recruitment
        </Link>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Job Openings
            </h1>
            <p className="mt-2 text-slate-500">
              Manage vacancies and recruitment campaigns.
            </p>
          </div>

          <Link
            href="/dashboard/employer/recruitment/jobs/new"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            <Plus size={17} />
            New Job
          </Link>
        </div>

        <div className="space-y-4">
          {RECRUITMENT_JOBS.map((job) => (
            <Link
              key={job.id}
              href={`/dashboard/employer/recruitment/jobs/${job.id}`}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:bg-slate-50"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-indigo-50 p-3">
                  <BriefcaseBusiness className="text-indigo-600" size={21} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    {job.title}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {job.department} · {job.location} · {job.employmentType}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5 text-sm text-slate-500">
                <span>{job.applicants} applicants</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                  {job.status}
                </span>
                <ArrowRight size={18} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
