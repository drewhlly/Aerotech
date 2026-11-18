"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
type Employee = {
  id: string;
  first_name: string;
  last_name: string;
  enrollment_status: string;
  samples: number;
};
type Review = {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  event_time: string;
  event_type: string;
  method: string;
  match_distance: number | null;
  liveness_passed: boolean;
  liveness_source: string;
  reason: string;
};
export default function FaceReview() {
  const [missed, setMissed] = useState<
    { id: string; first_name: string; last_name: string; event_time: string }[]
  >([]);
  const [employees, setEmployees] = useState<Employee[]>([]),
    [requests, setRequests] = useState<Review[]>([]),
    [note, setNote] = useState(""),
    [message, setMessage] = useState("Loading review queue…"),
    [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const r = await fetch("/api/attendance/face-review", { cache: "no-store" });
    const d = await r.json();
    if (!r.ok) throw Error(d.error);
    setEmployees(d.employees);
    setRequests(d.requests);
    setMissed(d.missed || []);
    setMessage(
      "Review identity in person or through your approved HR process. Never approve on the score alone.",
    );
  }, []);
  useEffect(() => {
    void Promise.resolve()
      .then(load)
      .catch((e) => setMessage(e.message));
  }, [load]);
  async function act(action: string, employeeId: string, requestId?: string) {
    setBusy(true);
    try {
      const r = await fetch("/api/attendance/face-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, employeeId, requestId, note }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      await load();
      setNote("");
      setMessage("Decision saved with an audit trail.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="face-workspace">
      <section className="aero-hero">
        <h1>Face attendance review</h1>
        <p>
          Only your organisation or assigned direct reports. Browser liveness is
          untrusted evidence.
        </p>
      </section>
      <section className="aero-card">
        <p role="status" aria-live="polite">
          {message}
        </p>
        <label className="block mt-4">
          Decision / reset reason (required)
          <textarea
            className="aero-input mt-2"
            minLength={10}
            maxLength={1000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Explain the identity check and your decision."
          />
        </label>
        <button
          className="aero-button border mt-3"
          disabled={busy}
          onClick={() =>
            void Promise.resolve()
              .then(load)
              .catch((e) => setMessage(e.message))
          }
        >
          Refresh
        </button>
        <p className="mt-3 text-sm">
          Approve requests in chronological order. Pending requests do not count
          as accepted attendance or feed payroll.
        </p>
      </section>
      {!!missed.length && (
        <section className="aero-card">
          <h2>Missed check-outs need correction</h2>
          {missed.map((m) => (
            <article className="face-request" key={m.id}>
              <strong>
                {m.first_name} {m.last_name}
              </strong>
              <time>Open since {new Date(m.event_time).toLocaleString()}</time>
              <p>
                Use your organisation’s authorised attendance correction
                process. Do not infer a checkout time or silently close this
                shift.
              </p>
            </article>
          ))}
        </section>
      )}
      <section className="aero-card">
        <h2>Needs review · {requests.length}</h2>
        {requests.map((r) => (
          <article className="face-request" key={r.id}>
            <h3>
              {r.first_name} {r.last_name} · {r.event_type.replace("_", " ")}
            </h3>
            <p>
              {new Date(r.event_time).toLocaleString()} · {r.method}
            </p>
            <p>
              Match distance:{" "}
              {r.match_distance == null
                ? "Not measured"
                : Number(r.match_distance).toFixed(3)}{" "}
              · Challenge:{" "}
              {r.liveness_passed
                ? "browser motion passed, not attested"
                : "not performed"}
            </p>
            <p>{r.reason}</p>
            <div className="flex flex-wrap gap-2">
              <button
                className="aero-button face-primary"
                disabled={busy || note.trim().length < 10}
                onClick={() => void act("approve", r.employee_id, r.id)}
              >
                Approve
              </button>
              <button
                className="aero-button border border-red-300 text-red-800"
                disabled={busy || note.trim().length < 10}
                onClick={() => void act("reject", r.employee_id, r.id)}
              >
                Reject
              </button>
            </div>
          </article>
        ))}
        {!requests.length && <p>No pending requests.</p>}
      </section>
      <section className="aero-card">
        <h2>Face enrollment status</h2>
        <p className="text-sm text-slate-600">
          Enrollment approval confirms identity through a supervised process. A
          request to enrol is optional and never records consent on the
          employee’s behalf.
        </p>
        {employees.map((e) => (
          <article className="face-request" key={e.id}>
            <h3>
              {e.first_name} {e.last_name}
            </h3>
            <p>
              {e.enrollment_status === "active"
                ? "Enrolled"
                : e.enrollment_status === "pending"
                  ? "Pending identity approval"
                  : "Not enrolled"}{" "}
              · {e.samples} samples
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                className="aero-button border"
                disabled={busy || note.trim().length < 10}
                onClick={() => void act("request_enrollment", e.id)}
              >
                Request enrollment
              </button>
              {e.enrollment_status === "pending" && (
                <button
                  className="aero-button face-primary"
                  disabled={busy || note.trim().length < 10}
                  onClick={() => void act("approve_enrollment", e.id)}
                >
                  Confirm supervised identity
                </button>
              )}
              {e.enrollment_status !== "not_enrolled" && (
                <button
                  className="aero-button border border-red-300 text-red-800"
                  disabled={busy || note.trim().length < 10}
                  onClick={() => void act("reset", e.id)}
                >
                  Delete / reset face data
                </button>
              )}
            </div>
          </article>
        ))}
      </section>
      <Link href="/privacy">Privacy information</Link>
    </div>
  );
}
