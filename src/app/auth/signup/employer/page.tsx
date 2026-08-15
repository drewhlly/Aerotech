"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, Globe2, UserRound } from "lucide-react";
import { Logo } from "@/components/aerotech-ui";

export default function EmployerSignupPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-[#07111f]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <Link href="/">
            <Logo light />
          </Link>

          <Link
            href="/auth/login"
            className="text-xs font-semibold text-slate-300 hover:text-white"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div className="rounded-3xl bg-[#07111f] p-8 text-white lg:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00D4FF] via-[#6366F1] to-[#9D4EDD]">
              <Building2 className="h-6 w-6" />
            </div>

            <h1 className="mt-7 text-3xl font-black">
              Build your workforce command center.
            </h1>

            <p className="mt-4 text-sm leading-7 text-slate-400">
              Set up your company once and connect recruitment, employees,
              attendance, training, performance and payroll.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Company workforce management",
                "Country-aware payroll configuration",
                "Employer payroll wallet",
                "AI workforce intelligence",
                "Employee 360°",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/10">
                    <span className="text-emerald-400">✓</span>
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                Employer setup
              </p>
              <h2 className="mt-2 text-2xl font-black">Create your account</h2>
              <p className="mt-2 text-sm text-slate-500">
                This information starts your employer workspace.
              </p>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-xs font-semibold text-slate-700">
                  Company name
                </span>
                <input
                  placeholder="Your company name"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-indigo-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-slate-700">
                  First name
                </span>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
                  <UserRound className="h-4 w-4 text-slate-400" />
                  <input
                    placeholder="First name"
                    className="h-12 w-full bg-transparent px-2 text-sm outline-none"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-slate-700">
                  Last name
                </span>
                <input
                  placeholder="Last name"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-indigo-400"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-xs font-semibold text-slate-700">
                  Work email
                </span>
                <input
                  type="email"
                  placeholder="admin@company.com"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-indigo-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-slate-700">
                  Country
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                  <Globe2 className="h-4 w-4 text-slate-400" />
                  <select className="h-12 w-full bg-transparent text-sm outline-none">
                    <option>Nigeria</option>
                    <option>Ghana</option>
                    <option>Kenya</option>
                    <option>South Africa</option>
                    <option>United Kingdom</option>
                    <option>United States</option>
                  </select>
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-slate-700">
                  Company size
                </span>
                <select className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none">
                  <option>1 - 10</option>
                  <option>11 - 50</option>
                  <option>51 - 250</option>
                  <option>251 - 1,000</option>
                  <option>1,000+</option>
                </select>
              </label>
            </div>

            <button
              onClick={() => router.push("/onboarding/employer")}
              className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#9D4EDD] text-sm font-bold text-white shadow-lg"
            >
              Continue company setup
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
              By continuing, you agree to the Aerotech platform terms and
              acknowledge that production payroll requires verified company and
              payment information.
            </p>

            <Link
              href="/"
              className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to website
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
