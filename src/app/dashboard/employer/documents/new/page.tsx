"use client";

import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import { useState } from "react";

export default function NewDocumentPage() {
  const [employee, setEmployee] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("employment");
  const [expiryDate, setExpiryDate] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    alert(
      `Document prepared for ${employee || "employee"}. Backend storage will be connected next.`
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/employer/documents"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Documents
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-8">
            <div className="mb-4 inline-flex rounded-xl bg-indigo-50 p-3">
              <Upload className="text-indigo-600" size={22} />
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Upload HR Document
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Add an employee document to the Aerotech HR records.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Employee
              </label>
              <select
                required
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
                className="input"
              >
                <option value="">Select employee</option>
                <option value="EMP-001">Amaka Okafor</option>
                <option value="EMP-002">Daniel Williams</option>
                <option value="EMP-003">Fatima Bello</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Document Title
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Employment Contract"
                className="input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
              >
                <option value="identity">Identity</option>
                <option value="employment">Employment</option>
                <option value="qualification">Qualification</option>
                <option value="payroll">Payroll</option>
                <option value="compliance">Compliance</option>
                <option value="policy">Policy</option>
                <option value="disciplinary">Disciplinary</option>
                <option value="performance">Performance</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                File
              </label>

              <input
                required
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Save Document
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
