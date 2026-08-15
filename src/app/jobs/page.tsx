"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { JobCard, PublicNav, jobs } from "@/components/aerotech-portal";

export default function JobsPage() {
  const [search, setSearch] = useState("");

  const filtered = jobs.filter((job) =>
    `${job.title} ${job.company} ${job.location} ${job.department}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      <PublicNav />

      <main className="bg-slate-50">
        <section className="bg-[#102A43] px-5 py-16 text-white">
          <div className="mx-auto max-w-7xl">
            <div className="text-sm font-bold uppercase tracking-widest text-[#00A896]">
              Aerotech Careers
            </div>
            <h1 className="mt-3 text-4xl font-black sm:text-5xl">
              Find your next opportunity.
            </h1>
            <p className="mt-4 max-w-2xl text-white/60">
              Discover roles from employers using Aerotech to build their
              workforce.
            </p>

            <div className="mt-8 flex max-w-3xl items-center gap-3 rounded-2xl bg-white p-3">
              <Search className="ml-2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs, companies or locations"
                className="w-full bg-transparent px-2 py-3 text-sm text-slate-800 outline-none"
              />
              <button className="hidden rounded-xl bg-[#00A896] px-5 py-3 font-bold text-white sm:flex sm:items-center sm:gap-2">
                <SlidersHorizontal size={16} />
                Filter
              </button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10">
          <div className="mb-6 flex items-center justify-between">
            <div className="font-bold text-[#102A43]">
              {filtered.length} opportunities
            </div>
            <div className="text-sm text-slate-400">
              Updated recently
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
