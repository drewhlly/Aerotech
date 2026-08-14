"use client";

import { FormEvent, useState } from "react";
import { UserRound, ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EmployeeSignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

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

    router.push("/");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-2xl">

        <button
          type="button"
          onClick={() => router.push("/auth/signup")}
          className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="mb-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-white">
            <UserRound size={28} />
          </div>

          <p className="text-sm font-semibold text-slate-500">
            Employee account
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Create your account
          </h1>

          <p className="mt-2 text-slate-600">
            Join Aerotech and build your professional profile.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10"
        >
          <div className="space-y-6">

            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  First name
                </label>

                <input
                  required
                  value={form.firstName}
                  onChange={(e) =>
                    updateField("firstName", e.target.value)
                  }
                  placeholder="e.g. John"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Last name
                </label>

                <input
                  required
                  value={form.lastName}
                  onChange={(e) =>
                    updateField("lastName", e.target.value)
                  }
                  placeholder="e.g. Doe"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>

            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email address
              </label>

              <input
                required
                type="email"
                value={form.email}
                onChange={(e) =>
                  updateField("email", e.target.value)
                }
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>

              <input
                required
                type="password"
                minLength={8}
                value={form.password}
                onChange={(e) =>
                  updateField("password", e.target.value)
                }
                placeholder="Minimum 8 characters"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Confirm password
              </label>

              <input
                required
                type="password"
                minLength={8}
                value={form.confirmPassword}
                onChange={(e) =>
                  updateField("confirmPassword", e.target.value)
                }
                placeholder="Re-enter your password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

          </div>

          <button
            type="submit"
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 font-semibold text-white hover:bg-slate-800"
          >
            Create account
            <ArrowRight size={18} />
          </button>
        </form>

      </div>
    </main>
  );
}
