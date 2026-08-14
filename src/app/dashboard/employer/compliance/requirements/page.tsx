"use client";

import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

import { DOCUMENT_REQUIREMENTS } from "@/lib/documents";

export default function RequirementsPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard/employer/compliance"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
        >
          <ArrowLeft size={16} />
          Back to Compliance
        </Link>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Document Requirements
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Define the records employees are required to maintain.
            </p>
          </div>

          <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
            <Plus size={17} />
            Add Requirement
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Requirement</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Applies To</th>
                <th className="px-6 py-4">Type</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {DOCUMENT_REQUIREMENTS.map((requirement) => (
                <tr key={requirement.id}>
                  <td className="px-6 py-5 font-medium text-slate-900">
                    {requirement.title}
                  </td>
                  <td className="px-6 py-5 capitalize text-sm text-slate-500">
                    {requirement.category}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500">
                    {requirement.requiredFor}
                  </td>
                  <td className="px-6 py-5">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {requirement.mandatory ? "Mandatory" : "Optional"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
