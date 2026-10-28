"use client";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { WorkspaceRoleContext } from "./workspace-shell";
import { api } from "./collaboration-client";
export default function CollaborationWidgets() {
  const [now] = useState(() => Date.now());
  const role = useContext(WorkspaceRoleContext),
    base = role === "employer" ? "/dashboard/employer" : "/employee";
  const [data, setData] = useState<{
      projects: { health: string }[];
      tasks: { status: string; due_at: string }[];
    } | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([
      api<{ records: { health: string }[] }>("/api/projects?limit=100"),
      api<{ records: { status: string; due_at: string }[] }>(
        "/api/projects/my-tasks?limit=100",
      ),
    ])
      .then(([p, t]) => {
        if (active) setData({ projects: p.records, tasks: t.records });
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <section className="aero-card mt-6">
      <h2 className="text-lg font-bold">Projects & tasks</h2>
      {error ? (
        <p role="status" className="mt-3 text-sm">
          {error}
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            {
              title: "Project health",
              value: data?.projects.filter((p) => p.health === "On track")
                .length,
              href: base + "/projects",
              help: "On track on the first 100 projects",
            },
            {
              title: "My open tasks",
              value: data?.tasks.filter(
                (t) => !["Done", "Cancelled"].includes(t.status),
              ).length,
              href: base + "/tasks",
              help: "First 100 visible tasks",
            },
            {
              title: "Overdue tasks",
              value: data?.tasks.filter(
                (t) =>
                  !["Done", "Cancelled"].includes(t.status) &&
                  t.due_at &&
                  Date.parse(t.due_at) < now,
              ).length,
              href: base + "/tasks",
              help: "Needs your attention",
            },
          ].map((w) => (
            <Link key={w.title} href={w.href} className="rounded-xl border p-4">
              <h3 className="text-sm">{w.title}</h3>
              <strong className="mt-2 block text-2xl">{w.value ?? "—"}</strong>
              <small>{w.help}</small>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
