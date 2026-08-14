"use client";

import { FormEvent, useState } from "react";
import { Building2, ArrowRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EmployerOnboardingPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    industry: "",
    companySize: "",
    country: "Nigeria",
    city: "",
    description: "",
  });

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    router.push("/dashboard/employer");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-2xl">

        <button
          type="button"
          onClick={() => router.push("/auth/signup/employer")}
          className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="mb-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Building2 size={28} />
          </div>

          <p className="text-sm font-semibold text-slate-500">
            Step 2 of 2
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Set up your company
          </h1>

          <p className="mt-2 text-slate-600">
            Tell Aerotech a little about your organization so we can
            personalize your workspace.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10"
        >
          <div className="space-y-6">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Industry
              </label>

              <select
                required
                value={form.industry}
                onChange={(e) => updateField("industry", e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
              >
                <option value="">Select industry</option>
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="fmcg">FMCG</option>
                <option value="retail">Retail</option>
                <option value="hospitality">Hospitality</option>
                <option value="healthcare">Healthcare</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="construction">Construction</option>
                <option value="education">Education</option>
                <option value="logistics">Logistics</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Company size
              </label>

              <select
                required
                value={form.companySize}
                onChange={(e) => updateField("companySize", e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
              >
                <option value="">Select company size</option>
                <option value="1-10">1–10 employees</option>
                <option value="11-50">11–50 employees</option>
                <option value="51-200">51–200 employees</option>
                <option value="201-500">201–500 employees</option>
                <option value="501-1000">501–1,000 employees</option>
                <option value="1000+">1,000+ employees</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Country
              </label>

              <input
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                City
              </label>

              <input
                required
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="e.g. Lagos"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                About your company
              </label>

              <textarea
                required
                rows={5}
                value={form.description}
                onChange={(e) =>
                  updateField("description", e.target.value)
                }
                placeholder="Briefly describe what your company does..."
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />
            </div>

          </div>

          <button
            type="submit"
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 font-semibold text-white hover:bg-slate-800"
          >
            Complete company setup
            <ArrowRight size={18} />
          </button>
        </form>

      </div>
    </main>
  );
}
