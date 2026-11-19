"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
type Notice = {
  id: string;
  title: string;
  body: string;
  href: string;
  created_at: string;
  read_at: string | null;
};
export default function Page() {
  const [notices, setNotices] = useState<Notice[]>([]),
    [message, setMessage] = useState("Loading meeting notifications…");
  useEffect(() => {
    let active = true;
    void fetch("/api/collaboration/notifications", { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        if (active) {
          setNotices(d.records);
          setMessage(d.records.length ? "" : "No meeting notifications yet.");
        }
      })
      .catch((e) => {
        if (active) setMessage(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <section className="aero-card space-y-4">
      <h1 className="text-2xl font-bold">Meeting notifications</h1>
      <p role="status">{message}</p>
      {notices.map((n) => (
        <article className="border-b py-4" key={n.id}>
          <h2 className="font-semibold">{n.title}</h2>
          <p>{n.body}</p>
          <time className="text-sm">
            {new Date(n.created_at).toLocaleString()}
          </time>
          {n.href.startsWith("/applicant/") && (
            <Link className="aero-button border" href={n.href}>
              Open meeting
            </Link>
          )}
        </article>
      ))}
    </section>
  );
}
