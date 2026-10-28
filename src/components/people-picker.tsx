"use client";
import { useEffect, useId, useState } from "react";
import { api } from "./collaboration-client";
export type Person = {
  id: string;
  name: string;
  email: string;
  department: string;
  staff_id?: string;
  job_title?: string;
  conflict?: boolean | null;
};
export default function PeoplePicker({
  value,
  onChange,
  project,
  startsAt,
}: {
  value: Person[];
  onChange: (v: Person[]) => void;
  project?: string;
  startsAt?: string;
}) {
  const uid = useId(),
    [q, setQ] = useState(""),
    [offset, setOffset] = useState(0),
    [records, setRecords] = useState<Person[]>([]),
    [more, setMore] = useState(false),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [active, setActive] = useState(-1);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      const query = new URLSearchParams({
        q,
        offset: String(offset),
        ...(project ? { project } : {}),
        ...(startsAt ? { startsAt } : {}),
      });
      void api<{ records: Person[]; hasMore: boolean }>(
        "/api/meet/people?" + query,
        "GET",
        undefined,
        controller.signal,
      )
        .then((d) => {
          setRecords(d.records);
          setMore(d.hasMore);
          setError("");
          setActive(-1);
        })
        .catch((e) => {
          if (e.name !== "AbortError") setError(e.message);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, offset, project, startsAt]);
  function toggle(person: Person) {
    onChange(
      value.some((x) => x.id === person.id)
        ? value.filter((x) => x.id !== person.id)
        : [...value, person],
    );
  }
  return (
    <div className="space-y-2">
      <label htmlFor={uid} className="block text-sm font-semibold">
        Find people
        <input
          id={uid}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={records.length > 0}
          aria-controls={uid + "-results"}
          aria-activedescendant={active >= 0 ? uid + "-" + active : undefined}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOffset(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => Math.min(i + 1, records.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            }
            if (e.key === "Escape") setActive(-1);
            if (e.key === "Enter" && active >= 0) {
              e.preventDefault();
              toggle(records[active]);
            }
          }}
          className="aero-input mt-2"
          placeholder="Name, email, staff ID, role or department"
        />
      </label>
      <p className="text-xs text-slate-600">
        Recent invitees first. Availability checks Aerotech meetings only.
      </p>
      {loading && <p role="status">Searching…</p>}
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      <div
        role="listbox"
        aria-label="People search results"
        aria-multiselectable="true"
        id={uid + "-results"}
        className="max-h-64 overflow-auto rounded-xl border"
      >
        {records.map((p, i) => (
          <div
            key={p.id}
            id={uid + "-" + i}
            role="option"
            aria-selected={value.some((x) => x.id === p.id)}
            tabIndex={0}
            onClick={() => toggle(p)}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                toggle(p);
              }
            }}
            className={
              "cursor-pointer border-b p-3 text-sm outline-offset-[-3px] hover:bg-blue-50 " +
              (active === i ? "bg-blue-50" : "")
            }
          >
            <b>{p.name}</b> {value.some((x) => x.id === p.id) && "✓"}
            <span className="block text-xs text-slate-600">
              {p.email} · {p.department} · {p.staff_id}
              {p.conflict === true
                ? " · Schedule conflict"
                : p.conflict === false
                  ? " · No known conflict"
                  : ""}
            </span>
          </div>
        ))}
        {!loading && !records.length && (
          <p className="p-3 text-sm">No matching people.</p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!offset}
          className="aero-button border"
          onClick={() => setOffset((n) => Math.max(0, n - 20))}
        >
          Previous people
        </button>
        <button
          type="button"
          disabled={!more}
          className="aero-button border"
          onClick={() => setOffset((n) => n + 20)}
        >
          Load more
        </button>
      </div>
    </div>
  );
}
