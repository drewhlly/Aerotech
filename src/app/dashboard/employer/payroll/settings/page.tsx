"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Globe2,
  Landmark,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import {
  getCountryComponents,
  validatePayrollConfiguration,
  type PayrollJurisdiction,
} from "@/lib/payroll-compliance";

const countries: Array<{
  code: PayrollJurisdiction;
  name: string;
  currency: string;
}> = [
  { code: "NG", name: "Nigeria", currency: "NGN" },
  { code: "GH", name: "Ghana", currency: "GHS" },
  { code: "KE", name: "Kenya", currency: "KES" },
  { code: "ZA", name: "South Africa", currency: "ZAR" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "US", name: "United States", currency: "USD" },
  { code: "CA", name: "Canada", currency: "CAD" },
];

export default function PayrollSettingsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-6 py-5">
          <Link
            href="/dashboard/employer/payroll"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Payroll
          </Link>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Aerotech Payroll
              </p>
              <h1 className="text-2xl font-bold">
                Global payroll & statutory settings
              </h1>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] px-6 py-7">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <Globe2 className="mt-1 h-6 w-6 text-slate-500" />

            <div>
              <h2 className="font-bold">Country-aware payroll</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                Aerotech is designed to support payroll across multiple
                jurisdictions. Tax, payee/PAYE, pension, social-security,
                health-insurance and employer contribution rules are configured
                by country and effective date instead of being embedded inside
                the employee record.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {countries.map((country) => {
            const config = validatePayrollConfiguration(country.code);
            const components = getCountryComponents(country.code);

            return (
              <div
                key={country.code}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      {country.code}
                    </p>
                    <h3 className="mt-1 text-lg font-bold">
                      {country.name}
                    </h3>
                  </div>

                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold">
                    {country.currency}
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <SettingRow
                    icon={<Landmark className="h-4 w-4" />}
                    label="Statutory components"
                    value={String(config.componentCount)}
                  />

                  <SettingRow
                    icon={<WalletCards className="h-4 w-4" />}
                    label="Mandatory components"
                    value={String(config.mandatoryCount)}
                  />

                  <SettingRow
                    icon={<ShieldCheck className="h-4 w-4" />}
                    label="Configuration"
                    value={config.configured ? "Configured" : "Pending"}
                  />
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Components
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {components.map((component) => (
                      <span
                        key={component.id}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                      >
                        {component.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-amber-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Validate current statutory rates before production payroll
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function SettingRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>

      <span className="text-xs font-bold text-slate-800">{value}</span>
    </div>
  );
}
