import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  CreditCard,
  History,
  Wallet,
} from "lucide-react";
import { PortalShell, WalletFundingCard } from "@/components/aerotech-portal";

export default function PayrollWalletPage() {
  return (
    <PortalShell role="employer">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="text-sm font-semibold text-slate-400">
            Payroll
          </div>
          <h1 className="mt-1 text-3xl font-black text-[#102A43]">
            Payroll Wallet
          </h1>
          <p className="mt-2 text-slate-500">
            Fund and manage the money required for payroll.
          </p>
        </div>

        <Link
          href="/dashboard/employer/payroll/pay"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102A43] px-5 py-3 font-bold text-white"
        >
          Review payroll
          <ArrowRight size={17} />
        </Link>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-[#102A43] p-5 text-white">
          <Wallet size={20} className="text-[#00A896]" />
          <div className="mt-4 text-sm text-white/50">Available balance</div>
          <div className="mt-1 text-3xl font-black">₦4,850,000</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <Banknote className="text-[#007F73]" />
          <div className="mt-4 text-sm text-slate-400">Payroll requirement</div>
          <div className="mt-1 text-2xl font-black text-[#102A43]">
            ₦3,920,000
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <CheckCircle2 className="text-[#00A896]" />
          <div className="mt-4 text-sm text-slate-400">Funding status</div>
          <div className="mt-1 text-xl font-black text-[#007F73]">Ready</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <History className="text-slate-500" />
          <div className="mt-4 text-sm text-slate-400">Transactions</div>
          <div className="mt-1 text-xl font-black text-[#102A43]">24</div>
        </div>
      </div>

      <div className="mt-7">
        <WalletFundingCard />
      </div>

      <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black text-[#102A43]">Recent wallet activity</h2>
            <p className="mt-1 text-sm text-slate-500">
              Funding and payroll movements.
            </p>
          </div>
          <History className="text-slate-400" />
        </div>

        <div className="mt-5 space-y-3">
          {[
            ["Wallet funded", "+₦5,000,000", "08 Aug 2026"],
            ["Payroll payment", "-₦3,920,000", "31 Jul 2026"],
            ["Wallet funded", "+₦4,000,000", "01 Jul 2026"],
          ].map(([title, amount, date]) => (
            <div
              key={`${title}-${date}`}
              className="flex items-center gap-4 rounded-xl bg-slate-50 p-4"
            >
              <div className="rounded-xl bg-white p-3">
                {amount.startsWith("+") ? (
                  <CreditCard className="text-[#00A896]" size={18} />
                ) : (
                  <Banknote className="text-[#102A43]" size={18} />
                )}
              </div>
              <div className="flex-1">
                <div className="font-bold text-[#102A43]">{title}</div>
                <div className="text-xs text-slate-400">{date}</div>
              </div>
              <div
                className={`font-black ${
                  amount.startsWith("+")
                    ? "text-[#007F73]"
                    : "text-[#102A43]"
                }`}
              >
                {amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
