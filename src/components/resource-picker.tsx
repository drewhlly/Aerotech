"use client";
import { useEffect, useId, useState } from "react";
import { api } from "./collaboration-client";
export default function ResourcePicker({
  label,
  endpoint,
  name,
  exclude,
}: {
  label: string;
  endpoint: string;
  name: string;
  exclude?: string;
}) {
  const uid = useId(),
    [q, setQ] = useState(""),
    [offset, setOffset] = useState(0),
    [rows, setRows] = useState<{ id: string; title?: string; name?: string }[]>(
      [],
    ),
    [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController(),
      timer = setTimeout(() => {
        void api<{ records: typeof rows }>(
          endpoint +
            "?" +
            new URLSearchParams({ q, offset: String(offset), limit: "20" }),
          "GET",
          undefined,
          controller.signal,
        )
          .then((r) => {
            setRows(r.records);
            setError("");
          })
          .catch((e) => {
            if (e.name !== "AbortError") setError(e.message);
          });
      }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [endpoint, q, offset]);
  return (
    <div className="space-y-2">
      <label htmlFor={uid} className="block text-sm">
        Search {label.toLowerCase()}
        <input
          id={uid}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOffset(0);
          }}
          className="aero-input"
        />
      </label>
      <label className="block text-sm">
        {label}
        <select required name={name} className="aero-input" defaultValue="">
          <option value="">Choose a record</option>
          {rows
            .filter((r) => r.id !== exclude)
            .map((r) => (
              <option key={r.id} value={r.id}>
                {r.title || r.name}
              </option>
            ))}
        </select>
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!offset}
          onClick={() => setOffset((n) => Math.max(0, n - 20))}
          className="aero-button border"
        >
          Previous results
        </button>
        <button
          type="button"
          disabled={rows.length < 20}
          onClick={() => setOffset((n) => n + 20)}
          className="aero-button border"
        >
          More results
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
