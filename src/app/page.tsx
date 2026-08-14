"use client";

import { useState } from "react";

const navigation = [
  { label: "Command Center", icon: "⌂" },
  { label: "People", icon: "♙" },
  { label: "Recruitment", icon: "◎" },
  { label: "Performance", icon: "↗" },
  { label: "Operations", icon: "⚙" },
  { label: "Analytics", icon: "▥" },
  { label: "Automations", icon: "✦" },
  { label: "Reports", icon: "▤" },
];

const alerts = [
  {
    level: "Critical",
    title: "2 operational issues require attention",
    description: "Both issues have remained unresolved beyond their expected resolution time.",
    time: "12 min ago",
  },
  {
    level: "Warning",
    title: "Recruitment bottleneck detected",
    description: "3 open positions have had no candidate movement for more than 7 days.",
    time: "1 hr ago",
  },
  {
    level: "Trend",
    title: "Workforce cost is trending upward",
    description: "Estimated workforce cost increased 8.4% compared with the previous month.",
    time: "Today",
  },
];

const activities = [
  ["New candidate entered pipeline", "Senior Software Engineer", "8 min ago"],
  ["Performance review completed", "Operations Department", "34 min ago"],
  ["Leave request submitted", "Product & Technology", "1 hr ago"],
  ["Maintenance task escalated", "Operations", "2 hrs ago"],
];

export default function Home() {
  const [active, setActive] = useState("Command Center");

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#111827]">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-[250px] shrink-0 border-r border-[#e5e7eb] bg-white lg:flex lg:flex-col">
          <div className="flex h-20 items-center border-b border-[#eef0f2] px-7">
            <div>
              <div className="text-xl font-bold tracking-[-0.04em]">AEROTECH</div>
              <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.22em] text-gray-400">
                Intelligent company OS
              </div>
            </div>
          </div>

          <div className="px-4 py-6">
            <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
              Workspace
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setActive(item.label)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                    active === item.label
                      ? "bg-[#111827] text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg text-sm">
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto border-t border-[#eef0f2] p-4">
            <button className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-gray-50">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                AC
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">Admin Console</div>
                <div className="truncate text-xs text-gray-400">Aerotech Workspace</div>
              </div>
              <span className="ml-auto text-gray-400">•••</span>
            </button>
          </div>
        </aside>

        {/* Main */}
        <section className="min-w-0 flex-1">
          {/* Header */}
          <header className="flex h-20 items-center justify-between border-b border-[#e5e7eb] bg-white px-5 sm:px-8">
            <div>
              <div className="text-sm text-gray-400">Friday, August 14, 2026</div>
              <h1 className="text-xl font-semibold tracking-[-0.02em]">
                Good afternoon, Alex.
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button className="hidden rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 sm:block">
                Search
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
                +
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
                ◔
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] p-5 sm:p-8">
            {/* Hero */}
            <div className="mb-7 rounded-2xl bg-[#111827] p-6 text-white shadow-sm sm:p-8">
              <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                <div className="max-w-2xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-gray-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Aerotech Intelligence is active
                  </div>

                  <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                    Your company,
                    <br />
                    intelligently managed.
                  </h2>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
                    Aerotech continuously analyzes your workforce, recruitment,
                    performance and operations to help you make better decisions.
                  </p>
                </div>

                <button className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100">
                  Ask Aerotech AI →
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["248", "Total People", "+8.2%", "vs last month"],
                ["18", "Open Positions", "6", "in final stage"],
                ["87%", "Performance", "+4.6%", "vs last quarter"],
                ["92", "Health Score", "+7", "vs last month"],
              ].map(([value, label, change, detail]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-xs text-gray-400">↗</span>
                  </div>
                  <div className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
                    {value}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="font-semibold text-emerald-600">{change}</span>
                    <span className="text-gray-400">{detail}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
              {/* Intelligence */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900 text-xs text-white">
                        ✦
                      </span>
                      <h3 className="font-semibold">Aerotech Intelligence</h3>
                    </div>
                    <p className="mt-1 text-sm text-gray-400">
                      What needs your attention
                    </p>
                  </div>
                  <button className="text-sm font-medium text-gray-500 hover:text-gray-900">
                    View all
                  </button>
                </div>

                <div className="divide-y divide-gray-100">
                  {alerts.map((alert) => (
                    <div
                      key={alert.title}
                      className="flex gap-4 px-6 py-5 transition hover:bg-gray-50"
                    >
                      <div
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                          alert.level === "Critical"
                            ? "bg-red-500"
                            : alert.level === "Warning"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col justify-between gap-1 sm:flex-row">
                          <h4 className="text-sm font-semibold">{alert.title}</h4>
                          <span className="text-xs text-gray-400">{alert.time}</span>
                        </div>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                          {alert.description}
                        </p>
                        <button className="mt-3 text-xs font-semibold text-gray-900">
                          Review recommendation →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Company health */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Company Health</h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Aerotech assessment
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Healthy
                  </span>
                </div>

                <div className="mt-8 flex items-end gap-3">
                  <span className="text-6xl font-semibold tracking-[-0.06em]">92</span>
                  <span className="mb-2 text-sm text-gray-400">/ 100</span>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full w-[92%] rounded-full bg-gray-900" />
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    ["People", "94"],
                    ["Recruitment", "86"],
                    ["Performance", "91"],
                    ["Operations", "97"],
                  ].map(([name, score]) => (
                    <div key={name}>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="text-gray-500">{name}</span>
                        <span className="font-semibold">{score}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-gray-800"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom */}
            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                  <div>
                    <h3 className="font-semibold">Workforce Overview</h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Current organizational snapshot
                    </p>
                  </div>
                  <button className="text-sm font-medium text-gray-500">Details →</button>
                </div>

                <div className="grid grid-cols-2 divide-x divide-gray-100 sm:grid-cols-4">
                  {[
                    ["248", "Employees"],
                    ["12", "Departments"],
                    ["9", "On Leave"],
                    ["4", "New Hires"],
                  ].map(([value, label]) => (
                    <div key={label} className="p-5">
                      <div className="text-2xl font-semibold">{value}</div>
                      <div className="mt-1 text-xs text-gray-400">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-5">
                  <h3 className="font-semibold">Recent Activity</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Latest company events
                  </p>
                </div>

                <div className="divide-y divide-gray-100">
                  {activities.map(([title, department, time]) => (
                    <div key={title} className="flex items-center gap-4 px-6 py-4">
                      <div className="h-2 w-2 rounded-full bg-gray-300" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{title}</div>
                        <div className="mt-0.5 text-xs text-gray-400">{department}</div>
                      </div>
                      <span className="text-xs text-gray-400">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 flex flex-col justify-between gap-2 border-t border-gray-200 pt-5 text-xs text-gray-400 sm:flex-row">
              <span>Aerotech Intelligence Platform · v0.1</span>
              <span>Built for companies that want to operate smarter.</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
