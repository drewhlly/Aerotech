"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, Mail, LockKeyhole, LoaderCircle } from "lucide-react";
import { safeReturnTo } from "@/lib/auth-navigation";
import AuthLayout from "./auth/auth-layout";
import { portalConfig } from "./auth/portal-config";
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
  return <PortalLoginForm key={role} role={role} returnTo={returnTo} />;
}

function PortalLoginForm({role,returnTo}:{role:"applicant"|"employee"|"employer";returnTo?:string}) {
  const [email, setEmail] = useState("");
  const [remember, setRemember] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{email?:string;password?:string}>({});
  const config = portalConfig[role];
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try { const saved = localStorage.getItem("aerotech-login-email:" + role); if (saved) {setEmail(saved); setRemember(true);} } catch { /* Storage is optional. */ }
    });
    return () => { active = false; };
  }, [role]);
  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    const errors = {email: !email.trim() ? "Enter your email address." : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? "Enter a valid email address." : undefined, password: !password ? "Enter your password." : undefined};
    setFieldErrors(errors);
    if(errors.email || errors.password){document.getElementById(errors.email ? "login-email" : "login-password")?.focus(); return;}
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
      await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(response.status === 429 ? "Too many sign-in attempts. Please try again in 15 minutes." : response.status === 423 ? "Access is temporarily locked. Contact support for help." : response.status === 401 || response.status === 403 ? "Unable to sign in with these credentials. Check your details and selected portal." : "Sign-in is currently unavailable. Please try again shortly.");
        return;
      }
      try { if (remember) localStorage.setItem("aerotech-login-email:" + role, email); else localStorage.removeItem("aerotech-login-email:" + role); } catch { /* Sign-in must work when storage is disabled. */ }
      window.location.assign(safeReturnTo(returnTo || config.redirectTarget, role));
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <AuthLayout portal={role}>
    <p className="portal-auth-eyebrow">{config.name}</p>
    <h1 id="portal-login-title">{config.title}</h1>
    <p className="portal-auth-subtitle">{config.subtitle}</p>
    <nav className="portal-auth-switcher" aria-label="Choose sign-in portal">
      {(["applicant", "employee", "employer"] as const).map(option => <Link key={option} href={"/auth/login?" + new URLSearchParams({role: option, ...(returnTo ? {next: safeReturnTo(returnTo, option)} : {})})} aria-current={role === option ? "page" : undefined}>{option[0].toUpperCase() + option.slice(1)}</Link>)}
    </nav>
    <noscript><p className="portal-auth-error">Enable JavaScript to sign in. Contact support if you need help.</p></noscript>
    <form method="post" action={"/api/auth/login/" + role} onSubmit={signIn} noValidate aria-busy={busy}>
      <fieldset disabled={busy}>
        <div className="portal-auth-field"><label htmlFor="login-email">Email address</label><div className="portal-auth-input"><Mail size={18} aria-hidden="true" /><input id="login-email" name="username" type="email" autoComplete="username" inputMode="email" autoCapitalize="none" spellCheck={false} required maxLength={254} value={email} onChange={e=>{setEmail(e.target.value);setFieldErrors(v=>({...v,email:undefined}));setError("");}} aria-invalid={!!fieldErrors.email} aria-describedby={fieldErrors.email ? "login-email-error" : undefined} placeholder={role === "employer" ? "you@company.com" : "you@example.com"} /></div>{fieldErrors.email && <p id="login-email-error" className="portal-auth-field-error" aria-live="polite">{fieldErrors.email}</p>}</div>
        <div className="portal-auth-field"><label htmlFor="login-password">Password</label><div className="portal-auth-input"><LockKeyhole size={18} aria-hidden="true" /><input id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required maxLength={256} value={password} onChange={e=>{setPassword(e.target.value);setFieldErrors(v=>({...v,password:undefined}));setError("");}} aria-invalid={!!fieldErrors.password} aria-describedby={fieldErrors.password ? "login-password-error" : undefined} /><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{fieldErrors.password && <p id="login-password-error" className="portal-auth-field-error" aria-live="polite">{fieldErrors.password}</p>}</div>
        <div className="portal-auth-options"><label><input type="checkbox" checked={remember} onChange={e=>{setRemember(e.target.checked);if(!e.target.checked)try{localStorage.removeItem("aerotech-login-email:"+role);}catch{}}} aria-describedby="remember-explanation" />Remember me</label><Link href={"/auth/forgot-password?role="+role}>Forgot password?</Link></div>
        <p id="remember-explanation" className="portal-auth-hint">Remembers your email on this device only. Your sign-in duration stays the same.</p>
        <div aria-live="polite" aria-atomic="true">{error && <p role="alert" className="portal-auth-error">{error}</p>}</div>
        <button type="submit" className="portal-auth-submit">{busy ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : null}{busy ? "Signing in…" : "Sign In"}{!busy && <ArrowRight size={18} aria-hidden="true" />}</button>
      </fieldset>
    </form>
    {config.signup ? <p className="portal-auth-register"><Link href={config.signup + (returnTo ? "?" + new URLSearchParams({next:safeReturnTo(returnTo,role)}) : "")}>{config.signupLabel}</Link></p> : <p className="portal-auth-invitation">Your organisation issues employee accounts. Ask HR for your activation link.</p>}
  </AuthLayout>;
}
