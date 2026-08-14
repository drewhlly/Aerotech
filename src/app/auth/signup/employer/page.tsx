"use client";

import { FormEvent, useState } from "react";
import { Building2, ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EmployerSignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    companyName: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    router.push("/onboarding/employer");
  }

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => router.push("/auth/signup")}
          className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Building2 size={28} />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-slate-900">
            Create your employer account
          </h1>

          <p className="mt-2 text-slate-600">
            Set up your Aerotech employer account to start managing your
            organization and workforce.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Company name
              </label>
              <input
                required
                value={form.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                placeholder="Enter your company name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Your full name
              </label>
              <input
                required
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Work email
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Phone number
              </label>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Confirm password
                </label>
                <input
                  required
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    updateField("confirmPassword", e.target.value)
                  }
                  placeholder="Repeat password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 font-semibold text-white transition hover:bg-slate-800"
            >
              Continue
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an Aerotech account?{" "}
            <button
              onClick={() => router.push("/auth/login")}
              className="font-semibold text-slate-900 hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
