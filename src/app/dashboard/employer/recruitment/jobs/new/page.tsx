"use client";

import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";

export default function NewRecruitmentJobPage() {
  const [saved, setSaved] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="mx-auto max-w-4xl">

        <Link
          href="/dashboard/employer/recruitment/jobs"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
        >
          <ArrowLeft size={16} />
          Jobs
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">

          <h1 className="text-2xl font-bold text-slate-900">
            Create Job Opening
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Define the vacancy before publishing it to candidates.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">

            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Job Title
              </span>
              <input className="input" placeholder="e.g. HR Manager" />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Department
              </span>
              <input className="input" placeholder="Human Resources" />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Location
              </span>
              <input className="input" placeholder="Lagos, Nigeria" />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Employment Type
              </span>
              <select className="input">
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Temporary</option>
                <option>Internship</option>
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Number of Openings
              </span>
              <input
                className="input"
                type="number"
                min="1"
                defaultValue="1"
              />
            </label>

            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Job Description
              </span>
              <textarea
                className="input min-h-32"
                placeholder="Describe the role, responsibilities and expectations."
              />
            </label>

            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Required Qualifications
              </span>
              <textarea
                className="input min-h-28"
                placeholder="Education, experience, skills and certifications."
              />
            </label>

          </div>

          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">

            {saved && (
              <p className="text-sm font-semibold text-emerald-600">
                Job saved as draft.
              </p>
            )}

            {!saved && <span />}

            <button
              onClick={() => setSaved(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            >
              <Save size={17} />
              Save Job
            </button>

          </div>
        </div>
      </div>
    </main>
  );
}
