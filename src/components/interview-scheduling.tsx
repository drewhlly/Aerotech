"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
type Slot = {
  id: string;
  job_id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  application_id: string | null;
  title: string;
  first_name?: string;
  last_name?: string;
};
type Application = {
  id: string;
  job_id: string;
  title: string;
  company_name: string;
  stage: string;
  interview_at: string | null;
  interview_room_id: string | null;
  interview_active: boolean;
};
type Data = {
  role: string;
  jobs?: { id: string; title: string }[];
  employees?: { id: string; first_name: string; last_name: string }[];
  applications?: Application[];
  slots: Slot[];
};
export default function InterviewScheduling({
  role,
}: {
  role: "employer" | "applicant";
}) {
  const [data, setData] = useState<Data | null>(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [selected, setSelected] = useState("");
  const load = useCallback(async () => {
    const r = await fetch("/api/recruitment/scheduling", { cache: "no-store" }),
      d = await r.json();
    if (!r.ok) throw Error(d.error);
    setData(d);
  }, []);
  useEffect(() => {
    queueMicrotask(() => void load().catch((e) => setError(e.message)));
  }, [load]);
  async function action(body: unknown) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const r = await fetch("/api/recruitment/scheduling", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
        d = await r.json();
      if (!r.ok) throw Error(d.error);
      await load();
      setNotice(
        "Interview scheduling updated. Notifications are queued; calendar files are available in your portal.",
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to save scheduling changes.",
      );
    } finally {
      setBusy(false);
    }
  }
  function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      date = new Date(String(f.get("startsAt")));
    if (!Number.isFinite(date.getTime())) {
      setError("Choose a valid local date and time.");
      return;
    }
    void action({
      action: "slot",
      jobId: f.get("jobId"),
      interviewerId: f.get("interviewerId") || null,
      startsAt: date.toISOString(),
      duration: Number(f.get("duration")),
    });
  }
  const application =
      data?.applications?.find((a) => a.id === selected) ||
      data?.applications?.[0],
    slots = (data?.slots || []).filter(
      (s) => role === "employer" || s.job_id === application?.job_id,
    );
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <div className="space-y-6">
      <header className="aero-hero">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200">
          Recruitment · Interviews
        </p>
        <h1 className="mt-3 text-3xl font-bold">
          {role === "employer"
            ? "Interview availability"
            : "Plan your interview"}
        </h1>
        <p className="mt-3 text-sm text-slate-200">
          {role === "employer"
            ? "Publish bookable slots and assign an interviewer. Candidates choose a time from their own portal."
            : "Choose an employer-published slot after shortlisting. Your interview stays inside Aerotech."}
        </p>
      </header>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
          <button
            onClick={() => void load().catch((e) => setError(e.message))}
            className="ml-3 underline"
          >
            Try again
          </button>
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900"
        >
          {notice}
        </p>
      )}
      {!data ? (
        <p role="status">Loading interview availability…</p>
      ) : (
        <>
          <p className="text-sm text-slate-600">
            Times are shown in your local timezone: {timezone}. Calendar
            downloads use UTC and update the same event when re-imported.
          </p>
          {role === "employer" ? (
            <form
              onSubmit={create}
              className="aero-card grid gap-4 sm:grid-cols-2"
            >
              <h2 className="text-xl font-bold sm:col-span-2">
                Publish a slot
              </h2>
              <div>
                <label htmlFor="slot-role" className="text-sm font-semibold">
                  Role
                </label>
                <select
                  id="slot-role"
                  name="jobId"
                  required
                  className="aero-input mt-2"
                >
                  <option value="">Choose role</option>
                  {data.jobs?.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="slot-interviewer"
                  className="text-sm font-semibold"
                >
                  Interviewer
                </label>
                <select
                  id="slot-interviewer"
                  name="interviewerId"
                  className="aero-input mt-2"
                >
                  <option value="">HR team</option>
                  {data.employees?.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.first_name} {e.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <label className="block text-sm font-semibold">
                Start time (your local timezone)
                <input
                  name="startsAt"
                  type="datetime-local"
                  required
                  className="aero-input mt-2"
                />
              </label>
              <div>
                <label
                  htmlFor="slot-duration"
                  className="text-sm font-semibold"
                >
                  Duration
                </label>
                <select
                  id="slot-duration"
                  name="duration"
                  defaultValue="60"
                  className="aero-input mt-2"
                >
                  {[15, 30, 45, 60, 90, 120].map((n) => (
                    <option key={n} value={n}>
                      {n} minutes
                    </option>
                  ))}
                </select>
              </div>
              <button
                disabled={busy || !data.jobs?.length}
                className="aero-button bg-blue-700 text-white sm:col-span-2"
              >
                {busy ? "Saving…" : "Publish availability"}
              </button>
            </form>
          ) : (
            <section className="aero-card">
              <h2 className="text-xl font-bold">Your eligible applications</h2>
              {!data.applications?.length ? (
                <p className="mt-3 text-sm text-slate-600">
                  No interview-eligible applications yet. HR will review your
                  assessment results before interview booking.
                </p>
              ) : (
                <>
                  <label
                    htmlFor="interview-application"
                    className="mt-4 block text-sm font-semibold"
                  >
                    Application
                  </label>
                  <select
                    id="interview-application"
                    value={application?.id || ""}
                    onChange={(e) => setSelected(e.target.value)}
                    className="aero-input mt-2"
                  >
                    {data.applications.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title} · {a.company_name}
                      </option>
                    ))}
                  </select>
                  {application?.interview_at &&
                    application.interview_room_id &&
                    application.interview_active && (
                      <div className="mt-4 rounded-xl bg-blue-50 p-4">
                        <p className="text-sm font-semibold">
                          Booked:{" "}
                          {new Date(application.interview_at).toLocaleString(
                            "en-GB",
                          )}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3">
                          <Link
                            className="aero-button bg-blue-700 text-white"
                            href={
                              "/applicant/meet/" + application.interview_room_id
                            }
                          >
                            Open interview room
                          </Link>
                          <a
                            className="aero-button border"
                            href={
                              "/api/recruitment/calendar?applicationId=" +
                              application.id
                            }
                          >
                            Add to calendar
                          </a>
                          <button
                            disabled={busy}
                            className="aero-button border"
                            onClick={() => {
                              const reason = window.prompt(
                                "Why do you need to cancel? HR will see this reason.",
                              );
                              if (reason)
                                void action({
                                  action: "cancel",
                                  applicationId: application.id,
                                  reason,
                                });
                            }}
                          >
                            Cancel interview
                          </button>
                        </div>
                        <p className="mt-3 text-xs text-slate-600">
                          Choose another available slot below to reschedule.
                          Contact HR for changes within 30 minutes of the
                          interview.
                        </p>
                      </div>
                    )}
                </>
              )}
            </section>
          )}
          <section className="aero-card">
            <h2 className="text-xl font-bold">
              {role === "employer"
                ? "Published availability"
                : "Available times"}
            </h2>
            {!slots.length ? (
              <p className="mt-4 text-sm text-slate-600">
                {role === "employer"
                  ? "No upcoming slots. Publish availability to let candidates choose a time."
                  : "No available times for this application. HR can publish more availability or schedule directly."}
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {slots.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-4 py-4"
                  >
                    <div>
                      <p className="font-semibold">
                        {new Date(s.starts_at).toLocaleString("en-GB")}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {s.title} ·{" "}
                        {Math.round(
                          (Date.parse(s.ends_at) - Date.parse(s.starts_at)) /
                            60000,
                        )}{" "}
                        minutes · {s.status}
                        {s.first_name
                          ? " · " + s.first_name + " " + s.last_name
                          : ""}
                      </p>
                    </div>
                    {role === "employer" ? (
                      s.status === "open" ? (
                        <button
                          disabled={busy}
                          className="aero-button border"
                          onClick={() =>
                            void action({ action: "remove_slot", id: s.id })
                          }
                        >
                          Remove slot
                        </button>
                      ) : (
                        s.application_id && (
                          <div className="flex flex-wrap gap-2">
                            <a
                              className="aero-button border"
                              href={
                                "/api/recruitment/calendar?applicationId=" +
                                s.application_id
                              }
                            >
                              Calendar file
                            </a>
                            <Link
                              className="aero-button border"
                              href={
                                "/dashboard/employer/recruitment/candidates/" +
                                s.application_id
                              }
                            >
                              Review candidate
                            </Link>
                          </div>
                        )
                      )
                    ) : (
                      application && (
                        <button
                          disabled={busy || s.status !== "open"}
                          className="aero-button bg-blue-700 text-white"
                          onClick={() =>
                            void action({
                              action: "book",
                              applicationId: application.id,
                              slotId: s.id,
                            })
                          }
                        >
                          {s.application_id === application.id
                            ? "Your booked slot"
                            : application.interview_room_id
                              ? "Reschedule here"
                              : "Book interview"}
                        </button>
                      )
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <Link
            className="inline-block text-sm font-semibold text-blue-700 underline"
            href={
              role === "employer"
                ? "/dashboard/employer/recruitment"
                : "/applicant/applications"
            }
          >
            {role === "employer"
              ? "Return to recruitment"
              : "View application history"}
          </Link>
        </>
      )}
    </div>
  );
}
