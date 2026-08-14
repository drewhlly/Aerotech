"use client";

import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";

export default function NewTrainingPage() {
  const [certification, setCertification] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/employer/training"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Training
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Create Training Program
          </h1>
          <p className="mt-2 text-slate-500">
            Set up a training program and make it available to employees.
          </p>
        </div>

        <form className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 font-semibold text-slate-900">
              Training Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Training Title">
                <input required className="input" placeholder="e.g. Workplace Safety" />
              </Field>

              <Field label="Training Type">
                <select className="input">
                  <option>Onboarding</option>
                  <option>Compliance</option>
                  <option>Technical</option>
                  <option>Leadership</option>
                  <option>Soft Skills</option>
                  <option>Professional</option>
                </select>
              </Field>

              <Field label="Trainer">
                <input className="input" placeholder="Trainer or facilitator" />
              </Field>

              <Field label="Location">
                <input className="input" placeholder="Physical location or Virtual" />
              </Field>

              <Field label="Start Date">
                <input type="date" required className="input" />
              </Field>

              <Field label="End Date">
                <input type="date" required className="input" />
              </Field>

              <Field label="Duration">
                <input className="input" placeholder="e.g. 2 days / 4 hours" />
              </Field>

              <Field label="Maximum Participants">
                <input type="number" min="1" className="input" placeholder="50" />
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Description">
                <textarea
                  rows={5}
                  className="input resize-none"
                  placeholder="Describe what employees will learn..."
                />
              </Field>
            </div>

            <label className="mt-5 flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={certification}
                onChange={(e) => setCertification(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium text-slate-700">
                Issue certificate upon successful completion
              </span>
            </label>
          </section>

          <div className="flex justify-end gap-3">
            <Link
              href="/dashboard/employer/training"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            >
              <Save size={17} />
              Create Training
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
