import { ArrowDownToLine, Banknote, Eye } from "lucide-react";
import { PortalShell } from "@/components/aerotech-portal";

export default function EmployeePayslipsPage() {
  const payslips = [
    ["July 2026", "₦420,000", "31 Jul 2026"],
    ["June 2026", "₦420,000", "30 Jun 2026"],
    ["May 2026", "₦405,000", "31 May 2026"],
  ];

  return (
    <PortalShell role="employee">
      <h1 className="text-3xl font-black text-[#102A43]">Payslips</h1>
      <p className="mt-2 text-slate-500">
        Access your payroll history and payslips.
      </p>

      <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#E6F7F5] p-3 text-[#007F73]">
            <Banknote />
          </div>
          <div>
            <div className="font-black text-[#102A43]">July 2026</div>
            <div className="text-sm text-slate-500">Net pay: ₦420,000</div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {payslips.map(([month, amount, date]) => (
            <div
              key={month}
              className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center"
            >
              <div className="flex-1">
                <div className="font-bold text-[#102A43]">{month}</div>
                <div className="text-sm text-slate-500">
                  Paid {date} · {amount}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-lg border border-slate-200 bg-white p-2">
                  <Eye size={16} />
                </button>
                <button className="rounded-lg border border-slate-200 bg-white p-2">
                  <ArrowDownToLine size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
