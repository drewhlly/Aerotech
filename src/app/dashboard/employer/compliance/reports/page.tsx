"use client";

import Link from "next/link";
import { ArrowLeft, Download, ShieldCheck } from "lucide-react";

import { DOCUMENTS, DOCUMENT_REQUIREMENTS } from "@/lib/documents";

export default function ComplianceReportsPage() {
  const total = DOCUMENTS.length;
  const active = DOCUMENTS.filter((d) => d.status === "active").length;
  const expiring = DOCUMENTS.filter((d) => d.status === "expiring").length;
  const mandatory = DOCUMENT_REQUIREMENTS.filter(
    (r) => r.mandatory
  ).length;

  const complianceRate =
    total > 0 ? Math.round((active / total) * 100) : 0;

  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard/employer/compliance"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
          >
            <ArrowLeft size={16} />
            Back to Compliance
          </Link>

          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
            <Download size={16} />
            Export Report
          </button>
        </div>

        <div className="mb-8">
          <p className="text-sm font-semibold text-indigo-600">
            COMPLIANCE REPORT
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            HR Compliance Summary
          </h1>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Compliance Rate</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {complianceRate}%
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Records</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {total}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Active Records</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {active}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Expiring</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {expiring}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3">
              <ShieldCheck className="text-emerald-600" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Compliance Overview
              </h2>
              <p className="text-sm text-slate-500">
                Current HR documentation status.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">
                  Active documentation
                </span>
                <span className="font-semibold text-slate-900">
                  {complianceRate}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${complianceRate}%` }}
                />
              </div>
            </div>

            <div className="grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">
                  Mandatory document types
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {mandatory}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Documents requiring attention
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {expiring}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
