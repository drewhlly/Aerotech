"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Users,
} from "lucide-react";
import { CANDIDATES } from "@/lib/recruitment-workflow";

export default function CandidatesPage() {
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Candidate Pipeline
          </h1>
          <p className="mt-2 text-slate-500">
            Manage applicants through the complete recruitment process.
          </p>
        </div>

        <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full bg-transparent text-sm outline-none"
            placeholder="Search candidates..."
          />
        </div>

        <div className="space-y-3">
          {CANDIDATES.map((candidate) => (
            <Link
              key={candidate.id}
              href={`/dashboard/employer/recruitment/candidates/${candidate.id}`}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:bg-slate-50 md:flex-row md:items-center"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-indigo-100 p-3">
                  <Users size={20} className="text-indigo-600" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    {candidate.name}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {candidate.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize">
                  {candidate.stage}
                </span>

                <span className="font-bold text-slate-700">
                  {candidate.score}%
                </span>

                <ArrowRight size={17} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
