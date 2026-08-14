"use client";

import Link from "next/link";
import {
  ArrowRight,
  FileCheck2,
  FileText,
  ShieldCheck,
  Upload,
  AlertTriangle,
} from "lucide-react";

import { DOCUMENTS } from "@/lib/documents";

const stats = [
  {
    label: "Total Documents",
    value: DOCUMENTS.length,
    icon: FileText,
  },
  {
    label: "Active",
    value: DOCUMENTS.filter((d) => d.status === "active").length,
    icon: FileCheck2,
  },
  {
    label: "Expiring Soon",
    value: DOCUMENTS.filter((d) => d.status === "expiring").length,
    icon: AlertTriangle,
  },
  {
    label: "Required",
    value: DOCUMENTS.filter((d) => d.required).length,
    icon: ShieldCheck,
  },
];

export default function DocumentsPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              HR DOCUMENTS
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Documents & Records
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage employee documents, records, expiry dates and compliance.
            </p>
          </div>

          <Link
            href="/dashboard/employer/documents/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Upload size={17} />
            Upload Document
          </Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="font-semibold text-slate-900">
              Employee Documents
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Document</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Expiry</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {DOCUMENTS.map((document) => (
                  <tr key={document.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">
                        {document.employeeName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {document.employeeId}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {document.title}
                    </td>

                    <td className="px-6 py-4 text-sm capitalize text-slate-500">
                      {document.category}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          document.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : document.status === "expired"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {document.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {document.expiryDate || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/employer/documents/${document.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        View
                        <ArrowRight size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link
            href="/dashboard/employer/compliance"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  Compliance Centre
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Monitor HR requirements, expiries and compliance gaps.
                </p>
              </div>
              <ArrowRight
                size={18}
                className="text-slate-400 transition group-hover:translate-x-1"
              />
            </div>
          </Link>

          <Link
            href="/dashboard/employer/compliance/expiring"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  Expiring Documents
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Review documents that need renewal.
                </p>
              </div>
              <ArrowRight
                size={18}
                className="text-slate-400 transition group-hover:translate-x-1"
              />
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
