"use client";

import Link from "next/link";
import { ArrowLeft, History, WalletCards } from "lucide-react";

export default function CompensationPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href="/dashboard/employer/employees/AER-EMP-001"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Employee
        </Link>

        <h1 className="text-2xl font-bold text-slate-900">Compensation</h1>
        <p className="mt-1 text-sm text-slate-500">
          Compensation and benefits information.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <Card label="Base Salary" value="₦450,000 / month" />
          <Card label="Allowances" value="₦75,000 / month" />
          <Card label="Total Monthly Package" value="₦525,000" />
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <History size={19} className="text-indigo-600" />
            <h2 className="font-bold text-slate-900">Compensation History</h2>
          </div>

          <div className="mt-5 space-y-4">
            <HistoryRow date="Jan 2026" value="₦450,000" reason="Annual review" />
            <HistoryRow date="Jan 2025" value="₦380,000" reason="Promotion adjustment" />
            <HistoryRow date="Jan 2024" value="₦300,000" reason="Initial salary" />
          </div>
        </div>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <WalletCards size={20} className="text-indigo-600" />
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function HistoryRow({
  date,
  value,
  reason,
}: {
  date: string;
  value: string;
  reason: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0">
      <div>
        <p className="font-semibold text-slate-900">{date}</p>
        <p className="text-sm text-slate-500">{reason}</p>
      </div>
      <p className="font-bold text-slate-900">{value}</p>
    </div>
  );
}
