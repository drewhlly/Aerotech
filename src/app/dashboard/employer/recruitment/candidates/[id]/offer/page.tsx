"use client";

import Link from "next/link";
import { ArrowLeft, FileText, Send } from "lucide-react";
import { useState } from "react";

import {
  getCandidate,
  getCandidateOffer,
  getJob,
} from "@/lib/recruitment-workflow";

export default function CandidateOfferPage({
  params,
}: {
  params: { id: string };
}) {
  const candidate = getCandidate(params.id);
  const offer = getCandidateOffer(params.id);
  const job = candidate ? getJob(candidate.jobId) : undefined;

  const [sent, setSent] = useState(false);

  if (!candidate) {
    return <div className="p-10">Candidate not found.</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="mx-auto max-w-4xl">

        <Link
          href={`/dashboard/employer/recruitment/candidates/${candidate.id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
        >
          <ArrowLeft size={16} />
          {candidate.name}
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

          <FileText className="text-emerald-600" size={28} />

          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            Employment Offer
          </h1>

          <p className="mt-2 text-slate-500">
            Prepare and issue the employment offer.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Candidate
              </label>
              <input
                className="input"
                value={candidate.name}
                readOnly
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Position
              </label>
              <input
                className="input"
                value={job?.title ?? ""}
                readOnly
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Currency
              </label>
              <select className="input" defaultValue="NGN">
                <option value="NGN">₦ Nigerian Naira</option>
                <option value="USD">$ US Dollar</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Salary
              </label>
              <input
                className="input"
                type="number"
                placeholder="Enter salary"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Start Date
              </label>
              <input
                className="input"
                type="date"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Offer Expiry
              </label>
              <input
                className="input"
                type="date"
              />
            </div>

          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">

            {offer && (
              <p className="mb-4 text-sm text-slate-500">
                Existing offer status: {offer.status}
              </p>
            )}

            {sent && (
              <p className="mb-4 text-sm font-semibold text-emerald-600">
                Offer prepared successfully.
              </p>
            )}

            <button
              onClick={() => setSent(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white"
            >
              <Send size={17} />
              Prepare & Send Offer
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
