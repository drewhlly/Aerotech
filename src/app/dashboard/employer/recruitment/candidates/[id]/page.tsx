import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  UserCheck,
} from "lucide-react";

import {
  getCandidate,
  getCandidateAssessment,
  getCandidateInterviews,
  getCandidateOffer,
  getJob,
} from "@/lib/recruitment-workflow";

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const candidate = getCandidate(id);

  if (!candidate) {
    return (
      <main className="min-h-screen bg-slate-50 p-10">
        <h1 className="text-2xl font-bold">Candidate not found</h1>
      </main>
    );
  }

  const job = getJob(candidate.jobId);
  const interviews = getCandidateInterviews(candidate.id);
  const assessment = getCandidateAssessment(candidate.id);
  const offer = getCandidateOffer(candidate.id);

  const steps = [
    { label: "Applied", active: true },
    {
      label: "Screening",
      active: ["screening", "shortlisted", "interview", "assessment", "offer", "hired"].includes(candidate.stage),
    },
    {
      label: "Interview",
      active: ["interview", "assessment", "offer", "hired"].includes(candidate.stage),
    },
    {
      label: "Assessment",
      active: ["assessment", "offer", "hired"].includes(candidate.stage),
    },
    {
      label: "Offer",
      active: ["offer", "hired"].includes(candidate.stage),
    },
    {
      label: "Hired",
      active: candidate.stage === "hired",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/dashboard/employer/recruitment/candidates"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
        >
          <ArrowLeft size={16} />
          Candidates
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700">
                {candidate.name
                  .split(" ")
                  .map((name) => name[0])
                  .join("")
                  .slice(0, 2)}
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {candidate.name}
                </h1>

                <p className="mt-1 text-slate-500">
                  {candidate.email} · {candidate.phone}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Applying for {job?.title}
                </p>
              </div>
            </div>

            <span className="h-fit rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold capitalize text-indigo-700">
              {candidate.stage}
            </span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Experience</p>
              <p className="mt-1 font-bold">{candidate.experience}</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Candidate Score</p>
              <p className="mt-1 font-bold">{candidate.score}%</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Application Source</p>
              <p className="mt-1 font-bold">{candidate.source}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">
            Recruitment Progress
          </h2>

          <div className="mt-6 grid gap-3 md:grid-cols-6">
            {steps.map((step) => (
              <div
                key={step.label}
                className={`rounded-xl border p-4 ${
                  step.active
                    ? "border-indigo-200 bg-indigo-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <CheckCircle2
                  size={18}
                  className={
                    step.active
                      ? "text-indigo-600"
                      : "text-slate-300"
                  }
                />

                <p className="mt-2 text-sm font-semibold">
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          <Link
            href={`/dashboard/employer/recruitment/candidates/${candidate.id}/interviews`}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:bg-slate-50"
          >
            <CalendarDays className="text-indigo-600" />

            <h2 className="mt-4 font-bold text-slate-900">
              Interviews
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {interviews.length} interview record
              {interviews.length === 1 ? "" : "s"}.
            </p>

            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">
              Manage
              <ArrowRight size={15} />
            </span>
          </Link>

          <Link
            href={`/dashboard/employer/recruitment/candidates/${candidate.id}/assessment`}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:bg-slate-50"
          >
            <ClipboardCheck className="text-amber-600" />

            <h2 className="mt-4 font-bold text-slate-900">
              Assessment
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {assessment
                ? `${assessment.score}% completed`
                : "No assessment yet."}
            </p>

            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-600">
              Manage
              <ArrowRight size={15} />
            </span>
          </Link>

          <Link
            href={`/dashboard/employer/recruitment/candidates/${candidate.id}/offer`}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:bg-slate-50"
          >
            <FileText className="text-emerald-600" />

            <h2 className="mt-4 font-bold text-slate-900">
              Employment Offer
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {offer ? offer.status : "Offer not created"}
            </p>

            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
              Manage
              <ArrowRight size={15} />
            </span>
          </Link>

        </div>

        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-start gap-4">
            <UserCheck className="mt-1 text-emerald-600" />

            <div>
              <h2 className="font-bold text-emerald-900">
                Hiring Decision
              </h2>

              <p className="mt-1 text-sm leading-6 text-emerald-800">
                Once the offer is accepted, Aerotech should convert this
                candidate directly into an employee record and begin the
                onboarding workflow.
              </p>

              <button className="mt-4 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white">
                Convert to Employee
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
