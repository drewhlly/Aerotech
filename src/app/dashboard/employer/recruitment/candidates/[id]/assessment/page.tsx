import Link from "next/link";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import {
  getCandidate,
  getCandidateAssessment,
} from "@/lib/recruitment-workflow";

export default async function CandidateAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = getCandidate(id);

  if (!candidate) {
    return <div className="p-10">Candidate not found.</div>;
  }

  const assessment = getCandidateAssessment(id);

  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="mx-auto max-w-4xl">

        <Link
          href={`/dashboard/employer/recruitment/candidates/${id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
        >
          <ArrowLeft size={16} />
          {candidate.name}
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

          <ClipboardCheck className="text-amber-600" size={28} />

          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            Candidate Assessment
          </h1>

          {assessment ? (
            <div className="mt-8">
              <p className="text-sm text-slate-500">
                Assessment
              </p>

              <h2 className="mt-1 text-xl font-bold">
                {assessment.name}
              </h2>

              <div className="mt-6 rounded-2xl bg-slate-50 p-6">
                <p className="text-sm text-slate-500">
                  Assessment Score
                </p>

                <p className="mt-2 text-4xl font-bold text-slate-900">
                  {assessment.score}%
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Status: {assessment.status}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-xl bg-slate-50 p-6 text-sm text-slate-500">
              No assessment has been assigned to this candidate.
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
