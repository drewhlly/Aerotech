"use client";


import WorkspaceShell from "./workspace-shell";
import BrandLogo from "./brand-logo";

import { useState } from "react";

import { Sparkles, X } from "lucide-react";


export function Logo({compact=false,light=false}:{compact?:boolean;light?:boolean}){return <BrandLogo compact={compact} light={light}/>;}



export function DashboardShell({children,title}:{children:React.ReactNode;title?:string}){return <WorkspaceShell role="employer" title={title}>{children}</WorkspaceShell>}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6366F1]">
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  gradient = false,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        gradient
          ? "border-indigo-200 bg-gradient-to-br from-[#00D4FF]/10 via-white to-[#9D4EDD]/10"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">{helper}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-50 to-violet-100">
          <Icon className="h-5 w-5 text-[#6366F1]" />
        </div>
      </div>
    </div>
  );
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState(
    "Hi! I’m Aerotech AI. Ask me about payroll, employees, attendance, training, recruitment or compliance."
  );

  const [busy, setBusy] = useState(false);
  async function ask() {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    try {
      const response = await fetch("/api/ai/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: prompt }) });
      const data = await response.json();
      setAnswer(response.ok ? data.answer : data.error || "AI is unavailable.");
      if (response.ok) setPrompt("");
    } catch { setAnswer("Unable to reach Aerotech AI."); } finally { setBusy(false); }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-[70] w-[min(390px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="bg-[#07111f] p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00D4FF] via-[#6366F1] to-[#9D4EDD]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Aerotech AI</p>
                  <p className="text-[10px] text-slate-400">
                    Workforce Intelligence
                  </p>
                </div>
              </div>

              <button onClick={() => setOpen(false)}>
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="max-h-[340px] overflow-y-auto p-4">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              {answer}
            </div>

            <div className="mt-4 flex gap-2">
              {["Payroll", "Attendance", "Training"].map((item) => (
                <button
                  key={item}
                  onClick={() => setPrompt(item)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 p-3">
            <div className="flex gap-2">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") ask();
                }}
                placeholder="Ask Aerotech AI..."
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-indigo-300"
              />
              <button
                onClick={ask}
                disabled={busy}
                className="rounded-xl bg-gradient-to-r from-[#6366F1] to-[#9D4EDD] px-4 text-xs font-bold text-white"
              >
                Ask
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#00D4FF] via-[#6366F1] to-[#9D4EDD] text-white shadow-2xl shadow-indigo-500/30"
        aria-label="Open Aerotech AI"
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </button>
    </>
  );
}

export {PublicNav} from './aerotech-portal';
