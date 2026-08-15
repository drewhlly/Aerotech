"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  Landmark,
  LockKeyhole,
  Wallet,
} from "lucide-react";
import {
  DashboardShell,
  PageHeader,
  AIAssistant,
} from "@/components/aerotech-ui";
import {
  employerOSData,
  formatMoney,
  paymentConfig,
  walletTransactions,
} from "@/lib/aerotech";

export default function PayrollWalletPage() {
  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState(paymentConfig.provider);
  const [message, setMessage] = useState("");

  const walletBalance = employerOSData.payroll.walletBalance;
  const payrollRequired = employerOSData.payroll.payrollRequired;

  function fundWallet() {
    const value = Number(amount.replace(/,/g, ""));

    if (!value || value <= 0) {
      setMessage("Enter a valid funding amount.");
      return;
    }

    setMessage(
      `Demo funding request created for ${formatMoney(value)} via ${provider}. Production gateway verification will happen after backend/payment integration.`
    );
  }

  return (
    <>
      <DashboardShell title="Payroll Wallet">
        <PageHeader
          eyebrow="PAYROLL CONTROL"
          title="Employer Payroll Wallet"
          description="Fund, monitor and control the money required for payroll."
          action={
            <Link
              href="/dashboard/employer/payroll"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to payroll
            </Link>
          }
        />

        <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl bg-[#07111f] p-7 text-white shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500">Available balance</p>
                  <p className="mt-2 text-4xl font-black">
                    {formatMoney(walletBalance)}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Demo environment · {paymentConfig.currency}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Wallet className="h-6 w-6 text-cyan-300" />
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] text-slate-500">Payroll required</p>
                  <p className="mt-1 text-sm font-bold">
                    {formatMoney(payrollRequired)}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] text-slate-500">After payroll</p>
                  <p className="mt-1 text-sm font-bold">
                    {formatMoney(walletBalance - payrollRequired)}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] text-slate-500">Status</p>
                  <p className="mt-1 text-sm font-bold text-emerald-400">
                    Funded
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold">Wallet transactions</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Funding and payroll movement ledger.
                  </p>
                </div>
              </div>

              <div className="mt-5 divide-y divide-slate-100">
                {walletTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          transaction.type === "credit"
                            ? "bg-emerald-50"
                            : "bg-slate-100"
                        }`}
                      >
                        {transaction.type === "credit" ? (
                          <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-slate-600" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold">
                          {transaction.description}
                        </p>
                        <p className="mt-1 truncate text-[10px] text-slate-400">
                          {transaction.reference} · {transaction.date}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-xs font-bold ${
                          transaction.type === "credit"
                            ? "text-emerald-600"
                            : "text-slate-700"
                        }`}
                      >
                        {transaction.type === "credit" ? "+" : "-"}
                        {formatMoney(transaction.amount)}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold">Fund payroll wallet</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                This is the employer funding UI. Production payment processing
                requires verified gateway credentials and server-side webhooks.
              </p>

              <label className="mt-6 block">
                <span className="mb-2 block text-xs font-semibold text-slate-700">
                  Amount
                </span>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4">
                  <span className="text-sm font-bold text-slate-400">₦</span>
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="5,000,000"
                    inputMode="numeric"
                    className="h-12 w-full bg-transparent px-2 text-sm outline-none"
                  />
                </div>
              </label>

              <label className="mt-4 block">
                <span className="mb-2 block text-xs font-semibold text-slate-700">
                  Payment provider
                </span>
                <select
                  value={provider}
                  onChange={(e) =>
                    setProvider(
                      e.target.value as "paystack" | "flutterwave" | "manual"
                    )
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
                >
                  <option value="paystack">Paystack</option>
                  <option value="flutterwave">Flutterwave</option>
                  <option value="manual">Manual / Bank Transfer</option>
                </select>
              </label>

              <button
                onClick={fundWallet}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#9D4EDD] text-sm font-bold text-white"
              >
                <CreditCard className="h-4 w-4" />
                Fund wallet
              </button>

              {message && (
                <div className="mt-4 rounded-xl bg-indigo-50 p-4 text-xs leading-5 text-indigo-700">
                  {message}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">
                    Wallet controls
                  </p>
                  <ul className="mt-2 space-y-2 text-[11px] leading-5 text-emerald-800">
                    <li>• Funding references</li>
                    <li>• Transaction ledger</li>
                    <li>• Payroll funding checks</li>
                    <li>• Approval controls</li>
                    <li>• Audit trail</li>
                    <li>• Provider abstraction</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex gap-3">
                <LockKeyhole className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-xs font-bold">Production security</p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    API secrets must remain server-side. Payment verification,
                    webhooks, idempotency and bank payouts belong in the
                    backend layer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardShell>

      <AIAssistant />
    </>
  );
}
