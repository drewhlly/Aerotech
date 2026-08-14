import Link from "next/link";
import { ArrowLeft, ArrowRight, Users } from "lucide-react";
import {
  CANDIDATES,
  getJob,
} from "@/lib/recruitment-workflow";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = getJob(id);

  if (!job) {
    return (
      <main className="min-h-screen bg-slate-50 p-10">
        <h1 className="text-2xl font-bold">Job not found</h1>
      </main>
    );
  }

  const applicants = CANDIDATES.filter(
    (candidate) => candidate.jobId === job.id
  );

  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/dashboard/employer/recruitment/jobs"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
        >
          <ArrowLeft size={16} />
          Jobs
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 md:flex-row">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {job.title}
              </h1>
              <p className="mt-2 text-slate-500">
                {job.department} · {job.location} · {job.employmentType}
              </p>
            </div>

            <span className="h-fit rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold capitalize text-emerald-700">
              {job.status}
            </span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Applicants</p>
              <p className="mt-1 text-2xl font-bold">{job.applicants}</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Openings</p>
              <p className="mt-1 text-2xl font-bold">{job.openings}</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Created</p>
              <p className="mt-1 text-2xl font-bold">{job.createdAt}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-bold text-slate-900">
              Candidates
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {applicants.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No applicants yet.
              </div>
            ) : (
              applicants.map((candidate) => (
                <Link
                  key={candidate.id}
                  href={`/dashboard/employer/recruitment/candidates/${candidate.id}`}
                  className="flex items-center justify-between p-5 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-indigo-100 px-4 py-3 font-bold text-indigo-700">
                      {candidate.name
                        .split(" ")
                        .map((name) => name[0])
                        .join("")
                        .slice(0, 2)}
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {candidate.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {candidate.email} · {candidate.experience} experience
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                      {candidate.stage}
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      {candidate.score}%
                    </span>
                    <ArrowRight size={17} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
