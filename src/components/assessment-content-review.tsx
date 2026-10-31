"use client";
import { useState, type FormEvent } from "react";
import type { Job } from "@/lib/ats";
export default function AssessmentContentReview({
  job,
  save,
}: {
  job: Job;
  save: (body: Record<string, unknown>) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      await save({
        action: "review_assessment",
        id: job.id,
        confirm: true,
        notes: f.get("notes"),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save review.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
      <h3 className="font-semibold">Assessment content review</h3>
      <p className="mt-2 text-sm text-slate-700">
        {job.assessment_reviewed_at
          ? "HR review recorded " +
            new Date(job.assessment_reviewed_at).toLocaleDateString("en-GB") +
            "."
          : "New applications are paused until HR reviews these questions."}{" "}
        Content review is not independent assessment validation.
      </p>
      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-semibold">
          Review question set and criteria
        </summary>
        <ol className="mt-3 space-y-4">
          {job.questions.map((q, i) => (
            <li key={i} className="rounded-lg bg-white p-3 text-sm">
              <p className="font-semibold">
                {i + 1}. {q.prompt}
              </p>
              <ul className="mt-2 space-y-1">
                {q.options.map((option, k) => (
                  <li key={k}>
                    {option}
                    {k === q.correct ? " · Correct answer" : ""}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <label className="block text-sm font-semibold">
            Job-related criteria and review notes
            <textarea
              name="notes"
              required
              minLength={20}
              maxLength={2000}
              defaultValue={job.assessment_review_notes || ""}
              className="aero-input mt-2"
            />
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" required className="mt-1" />I reviewed the
            questions, answer key, role relevance and accommodations. I will
            provide accountable human review of disputed results.
          </label>
          {error && (
            <p role="alert" className="text-sm text-red-800">
              {error}
            </p>
          )}
          <button
            disabled={busy || !job.questions.length}
            className="aero-button bg-blue-700 text-white"
          >
            {busy ? "Recording review…" : "Record assessment review"}
          </button>
        </form>
      </details>
    </section>
  );
}
