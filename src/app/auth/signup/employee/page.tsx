"use client";

import Link from "next/link";
import { ArrowRight, FileText, UploadCloud } from "lucide-react";
import { Logo } from "@/components/aerotech-portal";

export default function EmployeeSignupPage() {
  return (
    <div className="min-h-screen bg-[#F5F8FA]">
      <div className="mx-auto max-w-4xl px-5 py-8">
        <Logo />

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <div className="text-sm font-black uppercase tracking-widest text-[#00A896]">
            Applicant account
          </div>
          <h1 className="mt-3 text-3xl font-black text-[#102A43]">
            Apply and manage your career from one place.
          </h1>
          <p className="mt-3 text-slate-500">
            Create your Aerotech applicant profile, upload your CV and track
            your applications.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <input placeholder="First name" className="rounded-xl border border-slate-200 px-4 py-3.5" />
            <input placeholder="Last name" className="rounded-xl border border-slate-200 px-4 py-3.5" />
            <input placeholder="Email" type="email" className="rounded-xl border border-slate-200 px-4 py-3.5" />
            <input placeholder="Phone" className="rounded-xl border border-slate-200 px-4 py-3.5" />
            <input placeholder="Password" type="password" className="rounded-xl border border-slate-200 px-4 py-3.5 sm:col-span-2" />
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-6 text-center">
            <UploadCloud className="mx-auto text-slate-400" size={28} />
            <div className="mt-3 font-bold text-[#102A43]">
              Upload CV / Resume
            </div>
            <div className="mt-1 text-sm text-slate-400">
              PDF, DOC or DOCX
            </div>
          </div>

          <Link
            href="/applicant"
            className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-[#102A43] px-5 py-4 font-black text-white"
          >
            Create applicant account
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
