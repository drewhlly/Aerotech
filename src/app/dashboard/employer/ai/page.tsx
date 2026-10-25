"use client";

import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  CircleDollarSign,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import {
  AIAssistant,
  DashboardShell,
  PageHeader,
} from "@/components/aerotech-ui";


export default function AIPage() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState(
    "Ask me anything about your workforce. I can help with payroll, attendance, employees, training, recruitment and compliance."
  );

  const capabilities = [
    [CircleDollarSign, "Payroll Intelligence", "Review payroll readiness and identify potential issues."],
    [Activity, "Attendance Insights", "Find patterns in lateness, absence and shifts."],
    [GraduationCap, "Training Recommendations", "Identify learning gaps and recommend development."],
    [Users, "People Analytics", "Summarize workforce trends and employee movements."],
    [ShieldCheck, "Compliance", "Surface upcoming compliance and documentation tasks."],
    [Sparkles, "HR Reporting", "Turn workforce questions into management summaries."],
  ];

  const [busy, setBusy] = useState(false);
  async function ask() {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    try {
      const response = await fetch("/api/ai/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: prompt }) });
      const data = await response.json();
      setAnswer(response.ok ? data.answer : data.error || "AI unavailable.");
      if (response.ok) setPrompt("");
    } catch { setAnswer("Unable to reach Aerotech AI."); } finally { setBusy(false); }
  }

  return (
    <>
      <DashboardShell title="Aerotech AI">
        <PageHeader
          eyebrow="WORKFORCE INTELLIGENCE"
          title="Aerotech AI"
          description="Your intelligent HR and workforce assistant."
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00D4FF] via-[#6366F1] to-[#9D4EDD] text-white shadow-lg">
                <Bot className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Ask Aerotech AI</h2>
                <p className="text-xs text-slate-500">
                  Natural-language workforce intelligence
                </p>
              </div>
            </div>

            <div className="mt-8 min-h-[180px] rounded-2xl bg-slate-50 p-5">
              <div className="flex gap-3">
                <Sparkles className="h-5 w-5 shrink-0 text-indigo-500" />
                <p className="text-sm leading-7 text-slate-600">{answer}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") ask();
                }}
                placeholder="e.g. Is payroll ready for this month?"
                className="h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-indigo-400"
              />
              <button
                onClick={ask}
                disabled={busy}
                className="h-12 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#9D4EDD] px-6 text-sm font-bold text-white"
              >
                {busy ? "Thinking..." : "Ask AI"}
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "Is payroll ready?",
                "Explain attendance",
                "Recommend training",
                "Any compliance issues?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(suggestion)}
                  className="rounded-full border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#07111f] p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
              AI capabilities
            </p>

            <div className="mt-5 space-y-3">
              {["HR question answering", "Recruitment assistance", "Workforce guidance"].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-slate-300"
                >
                  <CheckIcon />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {capabilities.map(([Icon, title, description]) => (
            <div
              key={title as string}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              {Icon && (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                  <Icon className="h-5 w-5 text-indigo-600" />
                </div>
              )}
              <h3 className="mt-4 text-sm font-bold">{title as string}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {description as string}
              </p>
            </div>
          ))}
        </div>
      </DashboardShell>

      <AIAssistant />
    </>
  );
}

function CheckIcon() {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
      ✓
    </span>
  );
}
