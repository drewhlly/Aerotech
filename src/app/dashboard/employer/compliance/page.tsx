"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";

import {
  DOCUMENTS,
  DOCUMENT_REQUIREMENTS,
} from "@/lib/documents";

export default function CompliancePage() {
  const active = DOCUMENTS.filter((d) => d.status === "active").length;
  const expiring = DOCUMENTS.filter((d) => d.status === "expiring").length;
  const required = DOCUMENT_REQUIREMENTS.filter((r) => r.mandatory).length;

  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-indigo-600">
            HR COMPLIANCE
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Compliance Centre
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Keep employee records complete, valid and audit-ready.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <CheckCircle2 className="text-emerald-600" />
            <p className="mt-5 text-sm text-slate-500">Active Records</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {active}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <AlertTriangle className="text-amber-600" />
            <p className="mt-5 text-sm text-slate-500">Expiring</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {expiring}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <ShieldCheck className="text-indigo-600" />
            <p className="mt-5 text-sm text-slate-500">
              Mandatory Requirements
            </p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {required}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="font-semibold text-slate-900">
              Compliance Requirements
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {DOCUMENT_REQUIREMENTS.map((requirement) => (
              <div
                key={requirement.id}
                className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-slate-100 p-3">
                    <FileCheck2 size={18} className="text-slate-700" />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">
                      {requirement.title}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {requirement.requiredFor}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    requirement.mandatory
                      ? "bg-indigo-50 text-indigo-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {requirement.mandatory ? "Mandatory" : "Optional"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Link
            href="/dashboard/employer/compliance/requirements"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="font-semibold text-slate-900">
              Requirements
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Configure document requirements.
            </p>
            <ArrowRight
              className="mt-4 text-slate-400 transition group-hover:translate-x-1"
              size={18}
            />
          </Link>

          <Link
            href="/dashboard/employer/compliance/expiring"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="font-semibold text-slate-900">
              Expiring Documents
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Review upcoming expiries.
            </p>
            <ArrowRight
              className="mt-4 text-slate-400 transition group-hover:translate-x-1"
              size={18}
            />
          </Link>

          <Link
            href="/dashboard/employer/compliance/reports"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="font-semibold text-slate-900">
              Compliance Reports
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Generate compliance summaries.
            </p>
            <ArrowRight
              className="mt-4 text-slate-400 transition group-hover:translate-x-1"
              size={18}
            />
          </Link>
        </div>
      </div>
    </main>
  );
}
