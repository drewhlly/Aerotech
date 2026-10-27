"use client";
import { useState } from "react";
type Item = {
  id: string;
  title: string;
  due_at: string | null;
  starts_at: string | null;
  status: string;
};
const key = (d: Date) => d.toISOString().slice(0, 10);
export default function TaskCalendar<T extends Item>({
  tasks,
  timeline,
  onOpen,
}: {
  tasks: T[];
  timeline: boolean;
  onOpen: (t: T) => void;
}) {
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return new Date(
      Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), 1),
    ).toISOString();
  });
  const first = new Date(month),
    days = new Date(
      Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
    ).getUTCDate(),
    offset = (first.getUTCDay() + 6) % 7;
  function shift(n: number) {
    setMonth(
      new Date(
        Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + n, 1),
      ).toISOString(),
    );
  }
  const day = (n: number) =>
    new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), n));
  return (
    <section aria-label={timeline ? "Task timeline" : "Task calendar"}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button className="aero-button border" onClick={() => shift(-1)}>
          Previous month
        </button>
        <h2 className="font-semibold">
          {new Intl.DateTimeFormat("en-GB", {
            month: "long",
            year: "numeric",
            timeZone: "Africa/Lagos",
          }).format(first)}
        </h2>
        <button className="aero-button border" onClick={() => shift(1)}>
          Next month
        </button>
      </div>
      {timeline ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <caption className="sr-only">
              Task duration from start to due date; use task title to edit
            </caption>
            <thead>
              <tr>
                <th className="min-w-48 border p-2" scope="col">
                  Task
                </th>
                {Array.from({ length: days }, (_, i) => (
                  <th key={i} scope="col" className="min-w-8 border p-2">
                    {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <th scope="row" className="border p-2">
                    <button
                      className="min-h-11 text-left text-blue-800"
                      onClick={() => onOpen(t)}
                    >
                      {t.title}
                    </button>
                  </th>
                  {Array.from({ length: days }, (_, i) => {
                    const date = key(day(i + 1)),
                      start =
                        t.starts_at?.slice(0, 10) || t.due_at?.slice(0, 10),
                      end = t.due_at?.slice(0, 10);
                    const active = start && end && date >= start && date <= end;
                    return (
                      <td
                        key={i}
                        className={
                          "border p-1 " +
                          (active
                            ? t.status === "Done"
                              ? "bg-emerald-700"
                              : "bg-blue-700"
                            : "bg-white")
                        }
                      >
                        <span className="sr-only">
                          {date}: {active ? t.status : "No scheduled work"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid min-w-[560px] grid-cols-7 gap-px bg-slate-200 p-px">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="bg-slate-50 p-3 text-sm font-semibold">
                {d}
              </div>
            ))}
            {Array.from({ length: offset + days }, (_, i) =>
              i < offset ? (
                <div key={i} className="bg-slate-50" />
              ) : (
                <section
                  aria-label={key(day(i - offset + 1))}
                  key={i}
                  className="min-h-28 bg-white p-2"
                >
                  <h3 className="text-xs font-bold">{i - offset + 1}</h3>
                  {tasks
                    .filter(
                      (t) =>
                        t.due_at?.slice(0, 10) === key(day(i - offset + 1)),
                    )
                    .map((t) => (
                      <button
                        key={t.id}
                        className="mt-2 block min-h-11 w-full rounded-lg bg-blue-50 p-2 text-left text-xs text-blue-900"
                        onClick={() => onOpen(t)}
                      >
                        {t.title} · {t.status}
                      </button>
                    ))}
                </section>
              ),
            )}
          </div>
        </div>
      )}
    </section>
  );
}
