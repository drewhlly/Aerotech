"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { Logo } from "@/components/aerotech-ui";

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#07111f]">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,212,255,.2),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(157,78,221,.2),transparent_35%)]" />

          <div className="relative flex h-full flex-col justify-between p-12">
            <Logo light />

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                Employer Workforce OS
              </p>
              <h1 className="mt-4 max-w-xl text-5xl font-black leading-tight text-white">
                Welcome back to your workforce command center.
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400">
                Manage your people, recruitment, attendance, training,
                performance and payroll from one intelligent workspace.
              </p>
            </div>

            <p className="text-xs text-slate-600">
              People. Performance. Progress.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center bg-white p-6 sm:p-10">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-slate-500"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Aerotech
            </Link>

            <div className="lg:hidden">
              <Logo />
            </div>

            <div className="mt-8">
              <h2 className="text-3xl font-black text-slate-950">
                Sign in
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Access your Aerotech employer workspace.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-slate-700">
                  Work email
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@company.com"
                    className="h-12 w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-slate-700">
                  Password
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                  <LockKeyhole className="h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="h-12 w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </label>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-500">
                  <input type="checkbox" />
                  Remember me
                </label>
                <button className="font-semibold text-indigo-600">
                  Forgot password?
                </button>
              </div>

              <button
                onClick={() => router.push("/dashboard/employer")}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#9D4EDD] text-sm font-bold text-white shadow-lg"
              >
                Sign in to Command Center
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
              Don't have an employer account?{" "}
              <Link
                href="/auth/signup/employer"
                className="font-bold text-indigo-600"
              >
                Create one
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
