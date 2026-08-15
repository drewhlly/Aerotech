"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Globe2,
  Landmark,
  Wallet,
  Workflow,
} from "lucide-react";
import { Logo } from "@/components/aerotech-ui";

const steps = [
  "Company profile",
  "Payroll country",
  "Attendance",
  "Payroll & wallet",
  "Finish setup",
];

export default function EmployerOnboardingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <Link href="/">
            <Logo />
          </Link>
          <div className="text-xs font-semibold text-slate-500">
            Employer onboarding
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
        <div className="mb-10 flex flex-wrap items-center gap-2">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  index === 0
                    ? "bg-gradient-to-r from-[#6366F1] to-[#9D4EDD] text-white"
                    : "bg-white text-slate-400 border border-slate-200"
                }`}
              >
                {index + 1}
              </div>
              <span className="hidden text-xs font-semibold text-slate-500 sm:block">
                {step}
              </span>
              {index < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-slate-300" />
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-7 lg:grid-cols-[1fr_320px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              Step 1
            </p>
            <h1 className="mt-2 text-3xl font-black">Set up your workforce</h1>
            <p className="mt-2 text-sm text-slate-500">
              Configure the foundations Aerotech will use for your employer
              command center.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                [
                  Globe2,
                  "Country & currency",
                  "Nigeria · NGN",
                ],
                [
                  Workflow,
                  "Attendance capture",
                  "Web + mobile + QR + GPS",
                ],
                [
                  Landmark,
                  "Payroll compliance",
                  "PAYE + pension + statutory rules",
                ],
                [
                  Wallet,
                  "Payroll wallet",
                  "Fund payroll before processing",
                ],
              ].map(([Icon, title, value]) => (
                <div
                  key={title as string}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  {Icon && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Icon className="h-5 w-5 text-indigo-600" />
                    </div>
                  )}
                  <p className="mt-4 text-sm font-bold">{title as string}</p>
                  <p className="mt-1 text-xs text-slate-500">{value as string}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
              <p className="text-sm font-bold text-indigo-900">
                Payroll compliance foundation
              </p>
              <p className="mt-2 text-xs leading-6 text-indigo-700">
                Aerotech separates employee deductions, employer contributions,
                pension, PAYE and other country-specific statutory rules so that
                payroll can be configured by country instead of hard-coded into
                the application.
              </p>
            </div>

            <button
              onClick={() => router.push("/dashboard/employer")}
              className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#9D4EDD] text-sm font-bold text-white shadow-lg"
            >
              Open Employer Command Center
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-3xl bg-[#07111f] p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
              Setup checklist
            </p>

            <div className="mt-6 space-y-4">
              {[
                "Employer account created",
                "Company profile",
                "Country configured",
                "Attendance methods selected",
                "Payroll rules selected",
                "Wallet created",
                "AI workforce layer enabled",
              ].map((item) => (
                <div key={item} className="flex gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                  <span className="text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
