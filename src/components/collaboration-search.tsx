"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {Search} from "lucide-react";
import CollaborationDialog from "./collaboration-dialog";
import { api } from "./collaboration-client";
import { linkAllowed, type WorkspaceRole } from "@/lib/portal-policy";
export default function CollaborationSearch({ role,navigation=[] }: { role: WorkspaceRole;navigation?:{href:string;label:string}[] }) {
  const [open, setOpen] = useState(false),
    [q, setQ] = useState(""),
    [records, setRecords] = useState<
      { id: string; title: string; kind: string; href: string }[]
    >([]),
    [message, setMessage] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  useEffect(() => {
    if (!open) return;
    const c = new AbortController(),
      timer = setTimeout(
        () =>
          void api<{ records: typeof records }>(
            "/api/collaboration/search?q=" + encodeURIComponent(q),
            "GET",
            undefined,
            c.signal,
          )
            .then((d) => {
              setRecords(d.records.filter((r) => linkAllowed(role, r.href)));
              setLoading(false);
              setMessage("");
            })
            .catch((e) => {
              if (e.name !== "AbortError") { setMessage(e.message); setLoading(false); }
            }),
        250,
      );
    return () => {
      clearTimeout(timer);
      c.abort();
    };
  }, [open, q, role]);
  const matchingNavigation=navigation.filter(n=>n.label.toLowerCase().includes(q.toLowerCase())&&linkAllowed(role,n.href));
  if (!["employee", "employer"].includes(role)) return null;
  return (
    <>
      <button
        className="aero-button border text-sm"
        onClick={() => { setLoading(true); setOpen(true); }}
        aria-label="Search workspace, Control or Command K"
      >
        <Search aria-hidden="true" size={20} className="sm:hidden"/><span className="hidden sm:inline">Search</span>{" "}
        <kbd aria-hidden="true" className="hidden sm:inline">
          ⌘K
        </kbd>
      </button>
      {open && (
        <CollaborationDialog
          title="Search your workspace"
          close={() => setOpen(false)}
        >
          <label className="block">
            Search
            <input
              className="aero-input mt-2"
              value={q}
              onChange={(e) => { setLoading(true); setRecords([]); setMessage(""); setQ(e.target.value); }}
              placeholder="Projects, tasks, shared documents…"
            />
          </label>
          {message && <p role="alert" className="mt-3 text-sm text-red-700">{message}</p>}
          {loading && <p role="status" className="mt-3 text-sm text-slate-600">Searching…</p>}
          {!loading&&!message&&!matchingNavigation.length&&!records.length&&<p className="mt-4 text-sm text-slate-600">No results found. Try a different search.</p>}
          <ul className="mt-4 space-y-2">
            {matchingNavigation.map(n=><li key={n.href}><Link className="block rounded-xl border p-3 text-sm hover:bg-blue-50" href={n.href} onClick={()=>setOpen(false)}>{n.label}</Link></li>)}
            {records.map((r) => (
              <li key={r.kind + r.id}>
                <Link
                  className="block rounded-xl border p-3 text-sm hover:bg-blue-50"
                  href={r.href}
                  onClick={() => setOpen(false)}
                >
                  {r.title}
                  <span className="ml-3 text-xs text-slate-600">{r.kind}</span>
                </Link>
              </li>
            ))}
          </ul>
        </CollaborationDialog>
      )}
    </>
  );
}
