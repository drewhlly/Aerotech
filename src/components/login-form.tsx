"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, LockKeyhole, Sparkles, Eye, EyeOff } from "lucide-react";
import {safeReturnTo} from "@/lib/auth-navigation";

export default function LoginForm({requestedRole,returnTo}:{requestedRole:string;returnTo?:string}) {
  const role=requestedRole === "applicant" ? "applicant" : requestedRole === "employee" ? "employee" : "employer";
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
      window.location.assign(safeReturnTo(returnTo,role));
    } catch { setError("Unable to connect. Please try again."); }
    finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen bg-[#F5F8FA]">
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

            <nav aria-label="Choose sign-in role" className="mt-7 grid grid-cols-3 gap-2">{(['employer','employee','applicant'] as const).map(option=><Link key={option} onClick={()=>{setError('');setPassword('')}} href={'/auth/login?'+new URLSearchParams({role:option,...(returnTo?{next:safeReturnTo(returnTo,option)}:{})})} aria-current={role===option?'page':undefined} className={'rounded-lg px-2 py-3 text-center text-xs font-semibold '+(role===option?'bg-blue-700 text-white':'bg-slate-100 text-slate-700')}>{option[0].toUpperCase()+option.slice(1)} sign in</Link>)}</nav>{role==='employee'&&<p className="mt-4 text-sm text-slate-600">Employee access is by employer invitation. Ask HR for your activation link.</p>}

            <noscript><p className="mt-5 text-sm text-red-700">Enable JavaScript to sign in securely. Contact support if this page cannot load.</p></noscript>
            <form
              method="post" action={"/api/auth/login/"+role} className="mt-7 space-y-4"
              onSubmit={signIn}
            >
              <div>
                <label htmlFor="login-email" className="text-sm font-bold text-slate-700">
                  Email
                </label>
                <input
                  id="login-email" autoComplete="email" type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "employer" ? "you@company.com" : "you@example.com"}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="text-sm font-bold text-slate-700">
                  Password
                </label>
                <div className="relative mt-2">
                  <input
                    id="login-password" autoComplete="current-password" type={showPassword ? "text" : "password"}
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

              <Link href={"/auth/forgot-password?role="+role} className="inline-block text-sm font-semibold text-blue-700">Forgot password?</Link>
              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#07152c] px-5 py-3.5 font-black text-white disabled:opacity-60">
                {busy ? "Signing in..." : "Sign in"} <ArrowRight size={17} />
              </button>
            </form>

            <div className="mt-7 flex items-center gap-2 text-xs text-slate-600">
              <LockKeyhole size={14} />
              Your password is sent securely and is never shared with other portals.
            </div>

            {role==='employee'?<p className="mt-7 text-center text-sm text-slate-500">Use the activation link sent by your employer to set up your account.</p>:<div className="mt-7 text-center text-sm"><Link href={(role==='applicant'?'/auth/signup/applicant':'/auth/signup/employer')+(returnTo?'?'+new URLSearchParams({next:safeReturnTo(returnTo,role)}):'')} className="font-bold text-blue-700">{role==='applicant'?'Create free applicant account':'Create an employer account'}</Link></div>}

          </div>
        </div>
      </div>
    </main>
  );
}

