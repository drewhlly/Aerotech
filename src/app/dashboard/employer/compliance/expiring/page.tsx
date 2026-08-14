"use client";

import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

import { DOCUMENTS } from "@/lib/documents";

export default function ExpiringDocumentsPage() {
  const documents = DOCUMENTS.filter(
    (document) =>
      document.status === "expiring" ||
      document.status === "expired"
  );

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

        <div className="mb-8">
          <div className="mb-4 inline-flex rounded-xl bg-amber-50 p-3">
            <AlertTriangle className="text-amber-600" size={22} />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Expiring Documents
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Documents requiring attention or renewal.
          </p>
        </div>

        <div className="space-y-4">
          {documents.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <p className="font-semibold text-slate-900">
                No documents require attention.
              </p>
            </div>
          ) : (
            documents.map((document) => (
              <Link
                key={document.id}
                href={`/dashboard/employer/documents/${document.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {document.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {document.employeeName} · {document.employeeId}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      {document.status}
                    </span>

                    <p className="mt-2 text-sm text-slate-500">
                      Expiry: {document.expiryDate || "Unknown"}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
