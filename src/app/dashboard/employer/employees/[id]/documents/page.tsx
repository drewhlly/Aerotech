"use client";

import Link from "next/link";
import { ArrowLeft, Download, FileText, Upload } from "lucide-react";

const documents = [
  ["Employment Contract", "Signed", "Jan 15, 2024"],
  ["National Identification", "Verified", "Jan 12, 2024"],
  ["Educational Certificate", "Verified", "Jan 12, 2024"],
  ["Reference Check", "Completed", "Jan 14, 2024"],
  ["Confidentiality Agreement", "Signed", "Jan 15, 2024"],
];

export default function DocumentsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href="/dashboard/employer/employees/AER-EMP-001"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Employee
        </Link>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Employee Documents
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage and track the employee&apos;s HR documents.
            </p>
          </div>

          <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
            <Upload size={16} />
            Upload Document
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {documents.map(([name, status, date]) => (
            <div
              key={name}
              className="flex items-center justify-between border-b border-slate-100 p-5 last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <FileText size={19} />
                </div>

                <div>
                  <p className="font-semibold text-slate-900">{name}</p>
                  <p className="text-xs text-slate-500">
                    {status} · {date}
                  </p>
                </div>
              </div>

              <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <Download size={17} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
