"use client";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { WorkspaceRoleContext } from "./workspace-shell";
import { linkAllowed } from "@/lib/portal-policy";
import { api } from "./collaboration-client";
const events = [
  "assignment",
  "mention",
  "due",
  "overdue",
  "status",
  "comment",
  "meeting",
  "document",
];
type Pref = { event: string; in_app: boolean; email: boolean; digest: string };
export default function CollaborationNotifications() {
  const role = useContext(WorkspaceRoleContext) || "employee",
    [records, setRecords] = useState<
      {
        id: string;
        title: string;
        body: string;
        href: string;
        read_at: string | null;
      }[]
    >([]),
    [prefs, setPrefs] = useState<Pref[]>([]),
    [message, setMessage] = useState(""),
    [offset, setOffset] = useState(0);
  useEffect(() => {
    void api<{ records: typeof records; preferences: Pref[] }>(
      "/api/collaboration/notifications?offset=" + offset,
    )
      .then((d) => {
        setRecords(d.records);
        setPrefs(d.preferences);
      })
      .catch((e) => setMessage(e.message));
  }, [offset]);
  async function save(p: Pref) {
    try {
      await api("/api/collaboration/notifications", "PATCH", {
        event: p.event,
        inApp: p.in_app,
        email: p.email,
        digest: p.digest,
      });
      setPrefs((v) => [...v.filter((x) => x.event !== p.event), p]);
      setMessage("Preference saved.");
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  return (
    <section className="aero-card mt-6 space-y-4">
      <h2 className="text-xl font-bold">
        Project, meeting & document notifications
      </h2>
      {message && <p role="status">{message}</p>}
      {records.map((n) => (
        <article key={n.id} className="rounded-xl border p-3">
          <h3 className="font-semibold">{n.title}</h3>
          <p className="text-sm">{n.body}</p>
          <div className="mt-2 flex gap-3">
            {linkAllowed(role, n.href) && (
              <Link className="aero-button border" href={n.href}>
                Open
              </Link>
            )}
            {!n.read_at && (
              <button
                className="aero-button border"
                onClick={async () => {
                  await api("/api/collaboration/notifications", "PATCH", {
                    id: n.id,
                  });
                  setRecords((v) =>
                    v.map((x) =>
                      x.id === n.id
                        ? { ...x, read_at: new Date().toISOString() }
                        : x,
                    ),
                  );
                }}
              >
                Mark read
              </button>
            )}
          </div>
        </article>
      ))}
      <div className="flex gap-3">
        <button
          className="aero-button border"
          disabled={!offset}
          onClick={() => setOffset((n) => Math.max(0, n - 20))}
        >
          Previous
        </button>
        <button
          className="aero-button border"
          disabled={records.length < 20}
          onClick={() => setOffset((n) => n + 20)}
        >
          Next
        </button>
      </div>
      <h3 className="font-semibold">Notification preferences</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              {["Event", "In app", "Email", "Digest"].map((t) => (
                <th key={t} className="p-2">
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const p = prefs.find((p) => p.event === event) || {
                event,
                in_app: true,
                email: true,
                digest: "none",
              };
              return (
                <tr key={event}>
                  <th className="p-2 capitalize">{event}</th>
                  <td className="p-2">
                    <input
                      aria-label={event + " in app"}
                      checked={p.in_app}
                      type="checkbox"
                      onChange={(e) =>
                        void save({ ...p, in_app: e.target.checked })
                      }
                    />
                  </td>
                  <td className="p-2">
                    <input
                      aria-label={event + " email"}
                      checked={p.email}
                      type="checkbox"
                      onChange={(e) =>
                        void save({ ...p, email: e.target.checked })
                      }
                    />
                  </td>
                  <td className="p-2">
                    <select
                      aria-label={event + " digest"}
                      className="aero-input"
                      value={p.digest}
                      onChange={(e) =>
                        void save({ ...p, digest: e.target.value })
                      }
                    >
                      {["none", "daily", "weekly"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
