"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";
import { Logo } from "@/components/aerotech-portal";

export default function LoginPage() {
  const [role, setRole] = useState<"employer" | "employee">("employer");

  return (
    <div className="min-h-screen bg-[#F5F8FA]">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-5 py-10">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-2">
          <div className="hidden bg-[#102A43] p-10 text-white lg:block">
            <Logo light />
            <div className="mt-24">
              <Sparkles className="text-[#00A896]" size={32} />
              <h1 className="mt-5 text-4xl font-black leading-tight">
                One login. Your entire work experience.
              </h1>
              <p className="mt-5 leading-7 text-white/60">
                Aerotech connects employers, applicants and employees in one
                modern workforce ecosystem.
              </p>
            </div>
          </div>

          <div className="p-7 sm:p-10">
            <Logo />

            <h1 className="mt-10 text-3xl font-black text-[#102A43]">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to continue to Aerotech.
            </p>

            <div className="mt-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              {(["employer", "employee"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setRole(item)}
                  className={`rounded-lg py-2.5 text-sm font-bold capitalize ${
                    role === item
                      ? "bg-white text-[#102A43] shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <form
              className="mt-7 space-y-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div>
                <label className="text-sm font-bold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#00A896]"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#00A896]"
                />
              </div>

              <Link
                href={
                  role === "employer"
                    ? "/dashboard/employer"
                    : "/employee"
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-[#102A43] px-5 py-3.5 font-black text-white"
              >
                Sign in
                <ArrowRight size={17} />
              </Link>
            </form>

            <div className="mt-7 flex items-center gap-2 text-xs text-slate-400">
              <LockKeyhole size={14} />
              Your production account will be secured by the Aerotech
              authentication layer.
            </div>

            <div className="mt-7 text-center text-sm text-slate-500">
              New employer?{" "}
              <Link
                href="/auth/signup/employer"
                className="font-bold text-[#007F73]"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
