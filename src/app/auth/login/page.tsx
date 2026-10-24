"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";
import { Logo } from "@/components/aerotech-portal";

export default function LoginPage() {
  const [role, setRole] = useState<"employer" | "applicant" | "employee">("employer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch(role === "applicant" ? "/api/auth/login/applicant" : role === "employee" ? "/api/auth/login/employee" : "/api/auth/login/employer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setError(data.error || "Unable to sign in."); return; }
      window.location.assign(role === "applicant" ? "/jobs" : role === "employee" ? "/employee" : "/dashboard/employer");
    } catch { setError("Unable to connect. Please try again."); }
    finally { setBusy(false); }
  }

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

            <div className="mt-7 grid grid-cols-3 rounded-xl bg-slate-100 p-1">
              {(["employer", "employee", "applicant"] as const).map((item) => (
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
              onSubmit={signIn}
            >
              <div>
                <label className="text-sm font-bold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#00A896]"
                />
              </div>

              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#102A43] px-5 py-3.5 font-black text-white disabled:opacity-60">
                {busy ? "Signing in..." : "Sign in"} <ArrowRight size={17} />
              </button>
            </form>

            <div className="mt-7 flex items-center gap-2 text-xs text-slate-400">
              <LockKeyhole size={14} />
              Your production account will be secured by the Aerotech
              authentication layer.
            </div>

            <div className="mt-7 text-center text-sm text-slate-500">
              Need an account?{" "}
              <Link
                href="/auth/signup/employer"
                className="font-bold text-[#007F73]"
              >
                Create an employer account
              </Link>
            </div>
            <div className="mt-3 text-center text-sm"><Link href="/auth/signup/applicant" className="font-bold text-[#007F73]">Create free applicant account</Link></div>
          </div>
        </div>
      </div>
    </div>
  );
}
