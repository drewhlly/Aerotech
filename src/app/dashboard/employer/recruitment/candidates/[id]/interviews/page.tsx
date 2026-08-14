import Link from "next/link";
import { ArrowLeft, CalendarDays, Plus } from "lucide-react";
import {
  getCandidate,
  getCandidateInterviews,
} from "@/lib/recruitment-workflow";

export default async function CandidateInterviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = getCandidate(id);

  if (!candidate) {
    return <div className="p-10">Candidate not found.</div>;
  }

  const interviews = getCandidateInterviews(id);

  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="mx-auto max-w-5xl">

        <Link
          href={`/dashboard/employer/recruitment/candidates/${id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
        >
          <ArrowLeft size={16} />
          {candidate.name}
        </Link>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Interviews
            </h1>
            <p className="mt-2 text-slate-500">
              Schedule and manage candidate interviews.
            </p>
          </div>

          <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            <Plus size={17} />
            Schedule Interview
          </button>
        </div>

        <div className="space-y-4">
          {interviews.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
              No interviews scheduled.
            </div>
          ) : (
            interviews.map((interview) => (
              <div
                key={interview.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <CalendarDays className="text-indigo-600" />
                      <h2 className="font-bold text-slate-900">
                        {interview.type}
                      </h2>
                    </div>

                    <p className="mt-4 text-sm text-slate-600">
                      {interview.scheduledAt.replace("T", " ")}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Interviewer: {interview.interviewer}
                    </p>
                  </div>

                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold capitalize text-indigo-700">
                    {interview.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
