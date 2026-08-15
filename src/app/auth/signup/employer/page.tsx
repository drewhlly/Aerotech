"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/aerotech-portal";

export default function EmployerSignupPage() {
  return (
    <div className="min-h-screen bg-[#F5F8FA]">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <Logo />

        <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <div className="text-sm font-black uppercase tracking-widest text-[#00A896]">
            Employer setup
          </div>
          <h1 className="mt-3 text-3xl font-black text-[#102A43] sm:text-4xl">
            Build your workforce on Aerotech.
          </h1>
          <p className="mt-3 text-slate-500">
            Create your company workspace and start managing recruitment,
            people, training, attendance, payroll and compliance.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <input placeholder="Company name" className="rounded-xl border border-slate-200 px-4 py-3.5 outline-none" />
            <input placeholder="Company email" className="rounded-xl border border-slate-200 px-4 py-3.5 outline-none" />
            <input placeholder="Admin first name" className="rounded-xl border border-slate-200 px-4 py-3.5 outline-none" />
            <input placeholder="Admin last name" className="rounded-xl border border-slate-200 px-4 py-3.5 outline-none" />
            <input placeholder="Phone number" className="rounded-xl border border-slate-200 px-4 py-3.5 outline-none" />
            <input placeholder="Country" defaultValue="Nigeria" className="rounded-xl border border-slate-200 px-4 py-3.5 outline-none" />
            <input placeholder="Password" type="password" className="rounded-xl border border-slate-200 px-4 py-3.5 outline-none sm:col-span-2" />
          </div>

          <div className="mt-7 rounded-2xl bg-slate-50 p-5">
            <div className="font-black text-[#102A43]">
              Your Aerotech workspace includes
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "Recruitment & applicant tracking",
                "Employee 360 workforce management",
                "Attendance & leave",
                "Training & L&D",
                "Payroll & statutory compliance",
                "Payroll wallet & payment workflow",
                "Documents & performance",
                "Aerotech AI",
              ].map((item) => (
                <div key={item} className="flex gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="shrink-0 text-[#00A896]" size={17} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/onboarding/employer"
            className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-[#102A43] px-5 py-4 font-black text-white"
          >
            Create employer workspace
            <ArrowRight size={18} />
          </Link>

          <div className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-bold text-[#007F73]">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
