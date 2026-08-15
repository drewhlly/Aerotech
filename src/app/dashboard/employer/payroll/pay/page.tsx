"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CheckCircle2,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { PortalShell } from "@/components/aerotech-portal";

export default function EmployerPayrollPayPage() {
  const [approved, setApproved] = useState(false);

  const gross = 4320000;
  const deductions = 400000;
  const employerContributions = 180000;
  const net = 3920000;

  return (
    <PortalShell role="employer">
      <Link
        href="/dashboard/employer/payroll/wallet"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"
      >
        <ArrowLeft size={16} />
        Back to payroll wallet
      </Link>

      <div className="mt-5">
        <div className="text-sm font-semibold text-slate-400">
          Payroll processing
        </div>
        <h1 className="mt-1 text-3xl font-black text-[#102A43]">
          Review & Pay Payroll
        </h1>
        <p className="mt-2 text-slate-500">
          Review payroll before approving the payment.
        </p>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-black text-[#102A43]">July 2026 Payroll</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ["Employees", "248"],
              ["Gross payroll", `₦${gross.toLocaleString()}`],
              ["Employee deductions", `₦${deductions.toLocaleString()}`],
              ["Employer contributions", `₦${employerContributions.toLocaleString()}`],
              ["Net employee pay", `₦${net.toLocaleString()}`],
            ].map(([title, value]) => (
              <div key={title} className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold text-slate-400">
                  {title}
                </div>
                <div className="mt-2 text-lg font-black text-[#102A43]">
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-[#00A896]/20 bg-[#E6F7F5] p-4">
            <div className="flex items-center gap-2 font-bold text-[#007F73]">
              <CheckCircle2 size={18} />
              Payroll wallet has sufficient funds
            </div>
            <div className="mt-1 text-sm text-[#007F73]/70">
              Available: ₦4,850,000 · Required: ₦3,920,000
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {[
              "PAYE deductions reviewed",
              "Pension deductions reviewed",
              "Employee net pay reconciled",
              "Employer contributions calculated",
              "Payroll period locked for approval",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-600">
                <CheckCircle2 className="text-[#00A896]" size={17} />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-[#102A43] p-6 text-white">
          <Wallet className="text-[#00A896]" size={25} />

          <div className="mt-5 text-sm text-white/50">
            Amount to pay employees
          </div>
          <div className="mt-1 text-4xl font-black">
            ₦{net.toLocaleString()}
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Payroll wallet</span>
              <span>₦4,850,000</span>
            </div>

            <div className="mt-3 flex justify-between text-sm">
              <span className="text-white/50">After payment</span>
              <span>₦930,000</span>
            </div>
          </div>

          {!approved ? (
            <button
              onClick={() => setApproved(true)}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A896] px-5 py-4 font-black"
            >
              Approve & Pay Payroll
              <ArrowRight size={17} />
            </button>
          ) : (
            <div className="mt-7 rounded-xl bg-white/10 p-5">
              <div className="flex items-center gap-2 font-black">
                <CheckCircle2 className="text-[#00A896]" />
                Payroll approved
              </div>
              <p className="mt-2 text-sm leading-6 text-white/60">
                The production version will submit the payment instruction to
                the connected payment/disbursement provider.
              </p>
            </div>
          )}

          <div className="mt-5 flex items-center gap-2 text-xs text-white/40">
            <ShieldCheck size={14} />
            Payment authorization and audit controls
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
