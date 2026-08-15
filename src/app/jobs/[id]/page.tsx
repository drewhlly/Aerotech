"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, MapPin } from "lucide-react";
import { PublicNav, jobs } from "@/components/aerotech-portal";

export default function JobDetailsPage() {
  const params = useParams();
  const job = jobs.find((item) => item.id === params.id) ?? jobs[0];

  return (
    <>
      <PublicNav />

      <main className="bg-slate-50">
        <div className="mx-auto max-w-5xl px-5 py-10">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"
          >
            <ArrowLeft size={16} />
            Back to jobs
          </Link>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm lg:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E6F7F5] text-[#007F73]">
                  <Building2 />
                </div>
                <h1 className="mt-6 text-3xl font-black text-[#102A43] sm:text-4xl">
                  {job.title}
                </h1>
                <div className="mt-2 font-semibold text-slate-500">
                  {job.company}
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-2">
                    {job.location}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-2">
                    {job.type}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-2">
                    {job.department}
                  </span>
                </div>
              </div>

              <div className="font-black text-[#007F73]">{job.salary}</div>
            </div>

            <div className="my-8 border-t border-slate-200" />

            <h2 className="text-xl font-black text-[#102A43]">
              About the role
            </h2>
            <p className="mt-4 leading-8 text-slate-600">
              {job.description} This role provides an opportunity to work with
              a modern organisation and contribute directly to business growth.
            </p>

            <h2 className="mt-9 text-xl font-black text-[#102A43]">
              What you will do
            </h2>
            <div className="mt-4 space-y-3">
              {[
                "Collaborate with cross-functional teams.",
                "Own measurable outcomes and deliverables.",
                "Maintain accurate records and documentation.",
                "Use modern technology to improve productivity.",
              ].map((item) => (
                <div key={item} className="flex gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="mt-0.5 text-[#00A896]" size={18} />
                  {item}
                </div>
              ))}
            </div>

            <Link
              href={`/auth/signup/employee?job=${job.id}`}
              className="mt-9 flex items-center justify-center gap-2 rounded-xl bg-[#102A43] px-6 py-4 font-black text-white"
            >
              Apply for this role
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
