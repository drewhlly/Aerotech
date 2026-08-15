"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Globe2,
  Landmark,
  ShieldCheck,
} from "lucide-react";

const countries = [
  {
    code: "NG",
    name: "Nigeria",
    currency: "NGN",
    status: "Active",
  },
  {
    code: "GB",
    name: "United Kingdom",
    currency: "GBP",
    status: "Coming soon",
  },
  {
    code: "US",
    name: "United States",
    currency: "USD",
    status: "Coming soon",
  },
  {
    code: "CA",
    name: "Canada",
    currency: "CAD",
    status: "Coming soon",
  },
  {
    code: "ZA",
    name: "South Africa",
    currency: "ZAR",
    status: "Coming soon",
  },
  {
    code: "GH",
    name: "Ghana",
    currency: "GHS",
    status: "Coming soon",
  },
  {
    code: "KE",
    name: "Kenya",
    currency: "KES",
    status: "Coming soon",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    currency: "AED",
    status: "Coming soon",
  },
];

export default function PayrollSettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/employer/payroll"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div>
            <h1 className="text-sm font-bold text-slate-950">
              Payroll settings
            </h1>

            <p className="text-[10px] text-slate-400">
              Country & statutory configuration
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Compliance configuration
          </span>

          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            Payroll rules
          </h2>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Aerotech uses country-specific statutory rules for tax,
            pension and other payroll obligations. Rules are designed to
            be versioned by effective date.
          </p>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-3">
              <Globe2 className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <h3 className="font-bold">
                Payroll country
              </h3>

              <p className="text-xs text-slate-500">
                Select the jurisdiction governing this payroll.
              </p>
            </div>
          </div>

          <button className="mt-5 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold">
            <span className="flex items-center gap-3">
              🇳🇬 Nigeria
              <span className="text-xs font-normal text-slate-400">
                NGN
              </span>
            </span>

            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h3 className="font-bold">
              Supported jurisdictions
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Aerotech's payroll engine is designed for multi-country
              workforce management.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {countries.map((country) => (
              <div
                key={country.code}
                className="flex items-center justify-between p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                    {country.code}
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      {country.name}
                    </p>

                    <p className="text-[10px] text-slate-400">
                      Currency: {country.currency}
                    </p>
                  </div>
                </div>

                {country.status === "Active" ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-semibold text-slate-500">
                    Coming soon
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Landmark className="h-5 w-5 text-slate-500" />

            <h3 className="mt-4 font-bold">
              Tax authority
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Statutory tax calculations and remittance tracking.
            </p>

            <p className="mt-4 text-sm font-semibold">
              Nigeria Revenue Service
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <ShieldCheck className="h-5 w-5 text-slate-500" />

            <h3 className="mt-4 font-bold">
              Pension
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Employee and employer pension contributions are tracked
              separately.
            </p>

            <p className="mt-4 text-sm font-semibold">
              Pension Fund Custodian / PFA
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
