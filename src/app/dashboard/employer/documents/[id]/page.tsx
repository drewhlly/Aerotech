"use client";

import Link from "next/link";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import { useParams } from "next/navigation";

import { getDocumentById } from "@/lib/documents";

export default function DocumentDetailsPage() {
  const params = useParams();
  const document = getDocumentById(String(params.id));

  if (!document) {
    return (
      <main className="min-h-screen bg-slate-50 p-10">
        <h1 className="text-2xl font-bold text-slate-900">
          Document not found
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/employer/documents"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
        >
          <ArrowLeft size={16} />
          Back to Documents
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-indigo-50 p-3">
                <FileText className="text-indigo-600" size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {document.title}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {document.employeeName} · {document.employeeId}
                </p>
              </div>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <ShieldCheck size={14} />
              {document.status}
            </span>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Category
              </p>
              <p className="mt-1 capitalize text-slate-900">
                {document.category}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Required
              </p>
              <p className="mt-1 text-slate-900">
                {document.required ? "Yes" : "No"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Issued Date
              </p>
              <p className="mt-1 text-slate-900">
                {document.issuedDate || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Expiry Date
              </p>
              <p className="mt-1 text-slate-900">
                {document.expiryDate || "No expiry"}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">
              Audit Information
            </p>

            <div className="mt-3 grid gap-3 text-sm text-slate-500 md:grid-cols-2">
              <p>Uploaded: {document.uploadedAt}</p>
              <p>Uploaded by: {document.uploadedBy}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
