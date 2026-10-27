"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, LockKeyhole, Check, Eye, EyeOff } from "lucide-react";
import BrandLogo from "./brand-logo";
import { safeReturnTo } from "@/lib/auth-navigation";

export default function LoginForm({
  requestedRole,
  returnTo,
}: {
  requestedRole: string;
  returnTo?: string;
}) {
  const role =
    requestedRole === "applicant"
      ? "applicant"
      : requestedRole === "employee"
        ? "employee"
        : "employer";
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
      const response = await fetch(
        role === "applicant"
          ? "/api/auth/login/applicant"
          : role === "employee"
            ? "/api/auth/login/employee"
            : "/api/auth/login/employer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "Unable to sign in.");
        return;
      }
      window.location.assign(safeReturnTo(returnTo, role));
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="bg-[#f3f6fc] px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_70px_#06163f0b] lg:grid-cols-[.95fr_1.05fr]">
          <aside
            className="relative hidden flex-col justify-between overflow-hidden bg-[#06163F] p-10 text-white lg:flex xl:p-12"
            aria-label="Your Aerotech workspace"
          >
            <div
              className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full border-[50px] border-blue-500/10"
              aria-hidden="true"
            />
            <div className="relative">
              <p className="inline-flex rounded-full border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-[.16em] text-blue-100">
                A little more clarity. Every day.
              </p>
              <h2 className="mt-12 max-w-sm text-[44px] font-semibold leading-[1.13] tracking-tight">
                {role === "applicant" ? (
                  <>
                    Your next chapter
                    <br />
                    starts here.
                  </>
                ) : role === "employee" ? (
                  <>
                    A better place
                    <br />
                    for your workday.
                  </>
                ) : (
                  <>
                    Good people.
                    <br />
                    Great possibilities.
                  </>
                )}
              </h2>
              <p className="mt-5 max-w-sm text-base leading-7 text-slate-200">
                {role === "applicant"
                  ? "Find opportunities that fit, share your experience and keep track of what comes next."
                  : role === "employee"
                    ? "Stay close to your team, your records and the everyday details that matter."
                    : "Bring your team and everyday people operations into one organised workspace."}
              </p>
            </div>
            <div className="relative mt-12 space-y-4">
              {(role === "applicant"
                ? [
                    "Create your applicant account for free",
                    "Upload your CV and follow applications",
                    "Keep assessments and interviews together",
                  ]
                : role === "employee"
                  ? [
                      "View your payslips and shared documents",
                      "Follow leave requests and company updates",
                      "Find your assigned projects and tasks",
                    ]
                  : [
                      "Keep employee records organised",
                      "Connect hiring, payroll and people workflows",
                      "Follow projects, meetings and team progress",
                    ]
              ).map((text) => (
                <div
                  key={text}
                  className="flex items-start gap-3 border-t border-white/10 pt-4 text-sm leading-6 text-slate-100"
                >
                  <Check size={17} className="mt-1 text-blue-200" />
                  {text}
                </div>
              ))}
            </div>
            <p className="relative mt-12 text-xs leading-6 text-slate-300">
              One platform. Dedicated workspaces.
              <br />
              Access stays with the right people.
            </p>
          </aside>
          <section className="p-6 sm:p-10 xl:p-12" aria-label="Sign in">
            <BrandLogo />
            <p className="mt-8 text-xs font-semibold uppercase tracking-[.18em] text-blue-800">
              {role} workspace
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#06163F]">
              Welcome back.
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Choose your workspace and pick up where you left off.
            </p>
            <nav
              aria-label="Choose sign-in role"
              className="mt-7 grid grid-cols-3 gap-2"
            >
              {(["employer", "employee", "applicant"] as const).map(
                (option) => (
                  <Link
                    key={option}
                    onClick={() => {
                      setError("");
                      setPassword("");
                    }}
                    href={
                      "/auth/login?" +
                      new URLSearchParams({
                        role: option,
                        ...(returnTo
                          ? { next: safeReturnTo(returnTo, option) }
                          : {}),
                      })
                    }
                    aria-current={role === option ? "page" : undefined}
                    className={
                      "min-h-12 rounded-xl px-2 py-3 text-center text-xs font-semibold " +
                      (role === option
                        ? "bg-blue-700 text-white"
                        : "bg-slate-100 text-slate-700")
                    }
                  >
                    {option[0].toUpperCase() + option.slice(1)} sign in
                  </Link>
                ),
              )}
            </nav>
            {role === "employee" && (
              <p className="mt-4 text-sm text-slate-600">
                Employee access is by employer invitation. Ask HR for your
                activation link.
              </p>
            )}

            <noscript>
              <p className="mt-5 text-sm text-red-700">
                Enable JavaScript to sign in securely. Contact support if this
                page cannot load.
              </p>
            </noscript>
            <form
              method="post"
              action={"/api/auth/login/" + role}
              className="mt-7 space-y-4"
              onSubmit={signIn}
            >
              <div>
                <label
                  htmlFor="login-email"
                  className="text-sm font-bold text-slate-700"
                >
                  Email
                </label>
                <input
                  id="login-email"
                  autoComplete="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    role === "employer" ? "you@company.com" : "you@example.com"
                  }
                  className="aero-input mt-2 !bg-slate-50"
                />
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="text-sm font-bold text-slate-700"
                >
                  Password
                </label>
                <div className="relative mt-2">
                  <input
                    id="login-password"
                    autoComplete="current-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="aero-input !bg-slate-50 !pr-14"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 hover:text-[#07152c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Link
                href={"/auth/forgot-password?role=" + role}
                className="inline-block text-sm font-semibold text-blue-700"
              >
                Forgot password?
              </Link>
              {error && (
                <p role="alert" className="text-sm text-red-700">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#07152c] px-5 py-3.5 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                {busy ? "Signing in..." : "Sign in"} <ArrowRight size={17} />
              </button>
            </form>

            <div className="mt-7 flex items-center gap-2 text-xs text-slate-600">
              <LockKeyhole size={14} />
              Your password is sent securely and is never shared with other
              portals.
            </div>

            {role === "employee" ? (
              <p className="mt-7 text-center text-sm text-slate-500">
                Use the activation link sent by your employer to set up your
                account.
              </p>
            ) : (
              <div className="mt-7 text-center text-sm">
                <Link
                  href={
                    (role === "applicant"
                      ? "/auth/signup/applicant"
                      : "/auth/signup/employer") +
                    (returnTo
                      ? "?" +
                        new URLSearchParams({
                          next: safeReturnTo(returnTo, role),
                        })
                      : "")
                  }
                  className="font-bold text-blue-700"
                >
                  {role === "applicant"
                    ? "Create free applicant account"
                    : "Create an employer account"}
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
