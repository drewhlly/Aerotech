"use client";
import { useEffect, useState } from "react";
import { api } from "./collaboration-client";
export default function CollaborationAudit() {
  const [action, setAction] = useState(""),
    [company, setCompany] = useState(""),
    [offset, setOffset] = useState(0),
    [records, setRecords] = useState<
      {
        id: number;
        actor: string;
        action: string;
        resource_id: string;
        created_at: string;
        employer_id: string;
      }[]
    >([]),
    [message, setMessage] = useState("");
  useEffect(() => {
    const c = new AbortController(),
      timer = setTimeout(
        () =>
          void api<{ records: typeof records }>(
            "/api/admin/audit?" +
              new URLSearchParams({ action, company, offset: String(offset) }),
            "GET",
            undefined,
            c.signal,
          )
            .then((d) => setRecords(d.records))
            .catch((e) => {
              if (e.name !== "AbortError") setMessage(e.message);
            }),
        250,
      );
    return () => {
      clearTimeout(timer);
      c.abort();
    };
  }, [action, company, offset]);
  return (
    <section className="aero-card space-y-4">
      <h1 className="text-2xl font-bold">Sensitive-action audit</h1>
      {message && <p role="alert">{message}</p>}
      <div className="flex flex-wrap gap-3">
        <label>
          Action filter
          <input
            className="aero-input"
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setOffset(0);
            }}
          />
        </label>
        <label>
          Company ID
          <input
            className="aero-input"
            value={company}
            onChange={(e) => {
              setCompany(e.target.value);
              setOffset(0);
            }}
          />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              {["Date", "Company", "Actor", "Action", "Resource"].map((x) => (
                <th key={x} className="p-2">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                {[
                  r.created_at,
                  r.employer_id,
                  r.actor,
                  r.action,
                  r.resource_id,
                ].map((v, i) => (
                  <td key={i} className="border-t p-2">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        className="aero-button border"
        disabled={!offset}
        onClick={() => setOffset((v) => Math.max(0, v - 20))}
      >
        Previous
      </button>
      <button
        className="aero-button border"
        disabled={records.length < 20}
        onClick={() => setOffset((v) => v + 20)}
      >
        Next
      </button>
    </section>
  );
}
