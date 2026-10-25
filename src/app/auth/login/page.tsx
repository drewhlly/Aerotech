"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowRight, LockKeyhole, Sparkles, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/aerotech-portal";

function LoginForm() {
  const requestedRole = useSearchParams().get("role");
  const [role] = useState<"employer" | "applicant" | "employee">(requestedRole === "applicant" ? "applicant" : requestedRole === "employee" ? "employee" : "employer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
          <div className="hidden bg-[#07152c] p-10 text-white lg:block">

            <div className="mt-24">
              <Sparkles className="text-[#2563eb]" size={32} />
              <h1 className="mt-5 text-4xl font-black leading-tight">
                Your workspace. Your workday.
              </h1>
              <p className="mt-5 leading-7 text-white/60">
                Aerotech connects employers, applicants and employees in one
                modern workforce ecosystem.
              </p>
            </div>
          </div>

          <div className="p-7 sm:p-10">


            <h1 className="mt-10 text-3xl font-black text-[#07152c]">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to your dedicated Aerotech portal.
            </p>

            <p className="mt-7 rounded-xl bg-blue-50 p-3 text-sm font-bold capitalize">{role} portal</p>

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
                  placeholder={role === "employer" ? "you@company.com" : "you@example.com"}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">
                  Password
                </label>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 py-3.5 pl-4 pr-14 outline-none focus:border-[#2563eb]"
                  />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 hover:text-[#07152c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#07152c] px-5 py-3.5 font-black text-white disabled:opacity-60">
                {busy ? "Signing in..." : "Sign in"} <ArrowRight size={17} />
              </button>
            </form>

            <div className="mt-7 flex items-center gap-2 text-xs text-slate-400">
              <LockKeyhole size={14} />
              Your production account will be secured by the Aerotech
              authentication layer.
            </div>

            {role==='employee'?<p className="mt-7 text-center text-sm text-slate-500">Use the activation link sent by your employer to set up your account.</p>:<div className="mt-7 text-center text-sm"><Link href={role==='applicant'?'/auth/signup/applicant':'/auth/signup/employer'} className="font-bold text-blue-700">{role==='applicant'?'Create free applicant account':'Create an employer account'}</Link></div>}

          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage(){return <Suspense fallback={<p>Loading sign in...</p>}><LoginForm/></Suspense>;}
