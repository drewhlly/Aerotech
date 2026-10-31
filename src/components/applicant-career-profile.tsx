"use client";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
  useRef,
  type FormEvent,
} from "react";
type Profile = {
  skills: string;
  experience: string;
  education: string;
  cv_filename: string | null;
  general_completed_at: string | null;
  general_score: number | null;
  general_questions: { prompt: string; options: string[] }[];
};
export default function ApplicantCareerProfile() {
  const formRef = useRef<HTMLFormElement>(null),
    [profile, setProfile] = useState<Profile | null>(null),
    [loaded, setLoaded] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [fields, setFields] = useState({
      skills: "",
      experience: "",
      education: "",
    });
  const load = useCallback(async () => {
    const r = await fetch("/api/applicant/profile", { cache: "no-store" }),
      d = await r.json();
    if (!r.ok) throw Error(d.error);
    setProfile(d.profile);
    setFields({
      skills: d.profile?.skills || "",
      experience: d.profile?.experience || "",
      education: d.profile?.education || "",
    });
    setLoaded(true);
  }, []);
  useEffect(() => {
    queueMicrotask(() => void load().catch((e) => setError(e.message)));
  }, [load]);
  async function post(body: unknown) {
    const r = await fetch("/api/applicant/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
      d = await r.json();
    if (!r.ok) throw Error(d.error);
    return d;
  }
  async function fileData(file: File) {
    if (file.size > 2097152 || !file.name.toLowerCase().endsWith(".pdf"))
      throw Error("Choose a PDF CV of 2 MB or less.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  }
  async function extract() {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form),
      file = data.get("cv");
    setError("");
    setNotice("");
    if (data.get("consent") !== "on") {
      setError("Agree to private CV storage before extraction.");
      return;
    }
    if (!(file instanceof File) || !file.size) {
      setError("Choose a PDF CV first.");
      return;
    }
    setBusy(true);
    try {
      const d = await post({
        action: "extract_cv",
        consent: true,
        cv_data: await fileData(file),
      });
      if (d.fields)
        setFields((v) => ({
          skills: d.fields.skills || v.skills,
          experience: d.fields.experience || v.experience,
          education: d.fields.education || v.education,
        }));
      setNotice(
        d.message +
          (d.fields?.missing?.length
            ? " Check missing sections: " + d.fields.missing.join(", ") + "."
            : ""),
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Enter your CV information manually.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const f = new FormData(e.currentTarget),
        file = f.get("cv"),
        payload: Record<string, unknown> = {
          action: "profile",
          ...fields,
          reviewed: f.get("reviewed") === "on",
          consent: f.get("consent") === "on",
        };
      if (file instanceof File && file.size) {
        payload.cv_data = await fileData(file);
        payload.cv_filename = file.name;
      }
      await post(payload);
      await load();
      setNotice("Career profile saved. Complete the general assessment below.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save profile.");
    } finally {
      setBusy(false);
    }
  }
  async function assess(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await post({
        action: "general_assessment",
        answers: profile.general_questions.map((_, i) =>
          Number(f.get("q" + i)),
        ),
      });
      await load();
      setNotice("General assessment saved. You can now apply for a vacancy.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save assessment.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <header className="aero-hero">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200">
          Your career profile
        </p>
        <h1 className="mt-3 text-3xl font-bold">
          One profile. Your next opportunity.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-200">
          Profile and CV → general skills → application → job-specific
          assessment → HR review and interview.
        </p>
      </header>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
          {!loaded && (
            <button
              type="button"
              className="ml-3 underline"
              onClick={() => void load().catch((e) => setError(e.message))}
            >
              Try again
            </button>
          )}
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
      {!loaded && !error ? (
        <p role="status">Loading your profile…</p>
      ) : (
        loaded && (
          <>
            <form ref={formRef} onSubmit={save} className="aero-card space-y-5">
              <h2 className="text-xl font-bold">Professional background</h2>
              <p className="text-sm text-slate-600">
                Extract recognised sections from a text-based PDF, then review
                them. Scanned CVs can be entered manually. Identity checks are
                not enabled; these details remain self-reported.
              </p>
              <label className="block text-sm font-semibold">
                Upload CV · PDF, maximum 2 MB
                <input
                  name="cv"
                  type="file"
                  accept=".pdf,application/pdf"
                  required={!profile?.cv_filename}
                  className="aero-input mt-2"
                />
              </label>
              {profile?.cv_filename && (
                <a
                  className="inline-block text-sm font-semibold text-blue-700 underline"
                  href="/api/applicant/profile?download=cv"
                >
                  Download your saved CV: {profile.cv_filename}
                </a>
              )}
              <label className="flex items-start gap-3 text-sm">
                <input
                  name="consent"
                  type="checkbox"
                  required
                  className="mt-1"
                />
                I agree to store my CV privately. I choose which employers
                receive it when I apply.
              </label>
              <button
                type="button"
                disabled={busy}
                onClick={() => void extract()}
                className="aero-button border border-blue-200 text-blue-800"
              >
                Extract sections from selected CV
              </button>
              {(
                [
                  ["skills", "Skills and professional focus"],
                  ["experience", "Employment history and experience"],
                  ["education", "Education and qualifications"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label
                    htmlFor={"career-" + key}
                    className="block text-sm font-semibold"
                  >
                    {label}
                  </label>
                  <textarea
                    id={"career-" + key}
                    required
                    maxLength={10000}
                    rows={3}
                    className="aero-input mt-2"
                    value={fields[key]}
                    onChange={(e) =>
                      setFields({ ...fields, [key]: e.target.value })
                    }
                  />
                </div>
              ))}
              <label className="flex items-start gap-3 text-sm">
                <input
                  name="reviewed"
                  type="checkbox"
                  required
                  className="mt-1"
                />
                I reviewed this profile and confirm it accurately reflects my
                experience.
              </label>
              <p className="text-xs leading-5 text-slate-600">
                Your profile is private until you apply. Each application
                retains the CV and information shared at submission. Request
                access, correction or deletion through applicant Support,
                subject to lawful retention.
              </p>
              <button
                disabled={busy}
                className="aero-button bg-blue-700 text-white"
              >
                {busy ? "Saving…" : "Save career profile"}
              </button>
            </form>
            <section className="aero-card">
              <h2 className="text-xl font-bold">General skills assessment</h2>
              {profile?.general_completed_at ? (
                <>
                  <p className="mt-3 text-sm text-slate-600">
                    Completed · {profile.general_score}%
                  </p>
                  <Link
                    className="aero-button mt-4 bg-blue-700 text-white"
                    href="/applicant/opportunities"
                  >
                    Explore opportunities
                  </Link>
                </>
              ) : profile ? (
                <form onSubmit={assess} className="mt-5 space-y-5">
                  <p className="text-sm leading-6 text-slate-600">
                    One scored attempt, based on your stated professional focus.
                    This result is separate from the vacancy qualifying score.
                    Request an accommodation or review through Support.
                  </p>
                  {profile.general_questions.map((q, i) => (
                    <fieldset
                      key={i}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <legend className="px-1 text-sm font-semibold">
                        {i + 1}. {q.prompt}
                      </legend>
                      {q.options.map((option, n) => (
                        <label
                          className="mt-2 flex min-h-11 items-center gap-3 text-sm"
                          key={n}
                        >
                          <input
                            required
                            type="radio"
                            name={"q" + i}
                            value={n}
                          />
                          {option}
                        </label>
                      ))}
                    </fieldset>
                  ))}
                  <button
                    disabled={busy}
                    className="aero-button bg-blue-700 text-white"
                  >
                    {busy ? "Saving assessment…" : "Submit general assessment"}
                  </button>
                </form>
              ) : (
                <p className="mt-3 text-sm text-slate-600">
                  Save your reviewed profile and CV to start.
                </p>
              )}
              <Link
                href="/applicant/support"
                className="mt-4 inline-block text-sm font-semibold text-blue-700 underline"
              >
                Request assessment support or an accommodation
              </Link>
            </section>
          </>
        )
      )}
    </div>
  );
}
