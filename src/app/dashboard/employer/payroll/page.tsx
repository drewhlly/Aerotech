import Link from "next/link";
import {
  ArrowRight,
  CircleDollarSign,
  FileText,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import {
  AIAssistant,
  DashboardShell,
  PageHeader,
  StatCard,
} from "@/components/aerotech-ui";
import { employerOSData, formatMoney } from "@/lib/aerotech";

export default function PayrollPage() {
  const payroll = employerOSData.payroll;

  return (
    <>
      <DashboardShell title="Payroll">
        <PageHeader
          eyebrow="COMPENSATION"
          title="Payroll"
          description="Control payroll, statutory deductions, employer contributions and payslips."
          action={
            <div className="flex gap-2">
              <Link
                href="/dashboard/employer/payroll/wallet"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold"
              >
                <Wallet className="h-4 w-4 text-indigo-600" />
                Wallet
              </Link>
              <Link
                href="/dashboard/employer/payroll/run"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#9D4EDD] px-4 py-2.5 text-xs font-bold text-white"
              >
                Run payroll
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Gross payroll"
            value={formatMoney(payroll.gross)}
            helper="Current period"
            icon={CircleDollarSign}
          />
          <StatCard
            label="Employee tax"
            value={formatMoney(payroll.employeeTax)}
            helper="PAYE / country tax"
            icon={ShieldCheck}
          />
          <StatCard
            label="Pension"
            value={formatMoney(payroll.pension)}
            helper="Employee component"
            icon={FileText}
          />
          <StatCard
            label="Net pay"
            value={formatMoney(payroll.net)}
            helper="Employee take-home"
            icon={CircleDollarSign}
            gradient
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-bold">Payroll breakdown</h2>
            <div className="mt-5 space-y-4">
              {[
                ["Gross payroll", payroll.gross],
                ["PAYE / employee tax", payroll.employeeTax],
                ["Pension", payroll.pension],
                ["Other deductions", payroll.otherDeductions],
                ["Employer contributions", payroll.employerContributions],
                ["Employee net pay", payroll.net],
              ].map(([label, amount]) => (
                <div
                  key={label as string}
                  className="flex items-center justify-between border-b border-slate-100 pb-3"
                >
                  <span className="text-xs text-slate-500">{label as string}</span>
                  <span className="text-xs font-bold">
                    {formatMoney(amount as number)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-[#07111f] p-6 text-white">
            <h2 className="text-sm font-bold">Payroll controls</h2>
            <div className="mt-5 space-y-3">
              {[
                "Employer wallet funding",
                "Payroll approval",
                "Country tax rules",
                "Pension configuration",
                "Employer contributions",
                "Payslip generation",
                "Payroll audit trail",
                "Payment provider abstraction",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs"
                >
                  <ShieldCheck className="h-4 w-4 text-cyan-300" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardShell>

      <AIAssistant />
    </>
  );
}
