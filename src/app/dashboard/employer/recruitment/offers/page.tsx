"use client";

import Link from "next/link";
import { ArrowLeft, FileText, UserCheck } from "lucide-react";
import { OFFERS, CANDIDATES } from "@/lib/recruitment-workflow";

export default function OffersPage() {
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
            Offers & Hiring
          </h1>

          <p className="mt-2 text-slate-500">
            Manage employment offers and hiring decisions.
          </p>
        </div>

        {OFFERS.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <FileText className="mx-auto text-slate-400" size={30} />

            <h2 className="mt-4 font-bold text-slate-900">
              No active offers
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Offers created for candidates will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {OFFERS.map((offer) => {
              const candidate = CANDIDATES.find(
                (c) => c.id === offer.candidateId
              );

              return (
                <div
                  key={offer.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <UserCheck className="text-emerald-600" />

                      <div>
                        <h2 className="font-bold">
                          {candidate?.name}
                        </h2>

                        <p className="text-sm text-slate-500">
                          {offer.jobTitle}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize">
                      {offer.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
