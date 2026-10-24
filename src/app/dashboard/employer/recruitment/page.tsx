"use client";

import Link from "next/link";
import CandidateImport from "@/components/candidate-import";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  Users,
} from "lucide-react";

import {
  CANDIDATES,
  RECRUITMENT_JOBS,
} from "@/lib/recruitment-workflow";

const stats = [
  {
    label: "Open Positions",
    value: RECRUITMENT_JOBS.filter((j) => j.status === "open").length,
    icon: BriefcaseBusiness,
  },
  {
    label: "Total Applicants",
    value: CANDIDATES.length,
    icon: Users,
  },
  {
    label: "Interviews",
    value: CANDIDATES.filter((c) => c.stage === "interview").length,
    icon: Clock3,
  },
  {
    label: "Hired",
    value: CANDIDATES.filter((c) => c.stage === "hired").length,
    icon: CheckCircle2,
  },
];

export default function RecruitmentPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              Recruitment
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Recruitment & Hiring
            </h1>
            <p className="mt-2 text-slate-500">
              Manage the complete journey from vacancy to employee.
            </p>
          </div>

          <Link
            href="/dashboard/employer/recruitment/jobs/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus size={17} />
            Create Job
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-slate-100 p-3">
                    <Icon size={20} className="text-slate-700" />
                  </div>
                </div>

                <p className="mt-5 text-sm text-slate-500">
                  {stat.label}
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="font-bold text-slate-900">
                Open Positions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Active recruitment campaigns.
              </p>
            </div>

            <Link
              href="/dashboard/employer/recruitment/jobs"
              className="text-sm font-semibold text-indigo-600"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {RECRUITMENT_JOBS.map((job) => (
              <Link
                key={job.id}
                href={`/dashboard/employer/recruitment/jobs/${job.id}`}
                className="group flex flex-col gap-4 p-5 transition hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-indigo-50 p-3">
                      <BriefcaseBusiness
                        size={19}
                        className="text-indigo-600"
                      />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {job.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {job.department} · {job.location}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5 text-sm text-slate-500">
                  <span>{job.applicants} applicants</span>
                  <span>{job.openings} opening</span>

                  <ArrowRight
                    size={18}
                    className="transition group-hover:translate-x-1"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          <Link
            href="/dashboard/employer/recruitment/candidates"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5"
          >
            <Users className="text-indigo-600" />

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Candidate Pipeline
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Review applicants, screening results, interviews,
              assessments and hiring decisions.
            </p>

            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">
              Manage candidates
              <ArrowRight size={16} />
            </span>
          </Link>

          <Link
            href="/dashboard/employer/recruitment/offers"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5"
          >
            <FileText className="text-emerald-600" />

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Offers & Hiring
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Manage employment offers and convert successful
              candidates into employee records.
            </p>

            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
              Manage offers
              <ArrowRight size={16} />
            </span>
          </Link>

        </div>
      </div>
    </main>
  );
}
