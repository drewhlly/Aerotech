import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Globe2,
  Landmark,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import {
  AIAssistant,
  DashboardShell,
  PageHeader,
} from "@/components/aerotech-ui";
import { employerOSData, paymentConfig } from "@/lib/aerotech";

export default function PayrollSettingsPage() {
  return (
    <>
      <DashboardShell title="Payroll Settings">
        <PageHeader
          eyebrow="PAYROLL CONFIGURATION"
          title="Payroll Settings"
          description="Configure country, payroll, statutory deductions, pension and wallet controls."
          action={
            <Link
              href="/dashboard/employer/payroll"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Globe2 className="h-5 w-5 text-indigo-600" />
              <div>
                <h2 className="text-sm font-bold">Country configuration</h2>
                <p className="text-[10px] text-slate-500">
                  Payroll rules are selected by country.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <Field label="Country" value={employerOSData.company.country} />
              <Field label="Currency" value="NGN — Nigerian Naira" />
              <Field label="Payroll frequency" value="Monthly" />
              <Field label="Tax framework" value="Nigeria payroll configuration" />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <div>
                <h2 className="text-sm font-bold">Statutory deductions</h2>
                <p className="text-[10px] text-slate-500">
                  Employee and employer obligations.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {employerOSData.compliance.items.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                >
                  <div>
                    <p className="text-xs font-bold">{item.name}</p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {item.category}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Landmark className="h-5 w-5 text-indigo-600" />
              <div>
                <h2 className="text-sm font-bold">Pension</h2>
                <p className="text-[10px] text-slate-500">
                  Pension contribution configuration.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-indigo-50 p-5">
              <p className="text-xs font-bold text-indigo-900">
                Pension tracking enabled
              </p>
              <p className="mt-2 text-[11px] leading-5 text-indigo-700">
                Aerotech payroll separates employee pension deductions from
                employer pension contributions so each component can be reported
                and audited independently.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-indigo-600" />
              <div>
                <h2 className="text-sm font-bold">Payment configuration</h2>
                <p className="text-[10px] text-slate-500">
                  Provider abstraction for production integration.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <Field label="Mode" value={paymentConfig.mode} />
              <Field label="Provider" value={paymentConfig.provider} />
              <Field label="Currency" value={paymentConfig.currency} />
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[10px] leading-5 text-amber-800">
                Production API keys, webhook verification and bank payout
                credentials must be added server-side.
              </div>
            </div>
          </section>
        </div>
      </DashboardShell>

      <AIAssistant />
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700">
        {value}
      </div>
    </div>
  );
}
