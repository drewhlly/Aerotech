'use client';
import Link from 'next/link';
import {useEffect,useState,type FormEvent} from 'react';
import {Eye,EyeOff,LockKeyhole,Mail,LoaderCircle,ArrowRight} from 'lucide-react';
import AuthLayout,{loginPortals,type LoginRole} from '@/components/auth-layout';
import {safeReturnTo} from '@/lib/auth-navigation';

const roles:LoginRole[]=['employer','employee','applicant'];
const emailKey='aerotech:remembered-login-email';
export default function LoginForm({requestedRole,returnTo}:{requestedRole:string;returnTo?:string}){
 const role:LoginRole=requestedRole==='employee'?'employee':requestedRole==='applicant'?'applicant':'employer';
 const portal=loginPortals[role];
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[remember,setRemember]=useState(false);
 const [visible,setVisible]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{let saved:string|null=null;try{saved=window.localStorage.getItem(emailKey)}catch{}if(saved)void Promise.resolve().then(()=>{setEmail(saved!);setRemember(true)})},[]);
 async function signIn(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;setError('');
  const cleanEmail=email.trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)||cleanEmail.length>254){setError('Enter a valid email address.');return}
  if(!password){setError('Enter your password.');return}
  setBusy(true);
  try{
   const response=await fetch('/api/auth/login/'+role,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:cleanEmail,password})});
   if(!response.ok){
    setError(response.status===401?'Invalid email or password.':response.status===429?'Too many sign-in attempts. Please try again later.':response.status===423?'Your account is temporarily locked. Contact support.':response.status>=500?'Sign-in is temporarily unavailable. Please try again.':'Unable to sign in. Check your details and try again.');
    return;
   }
   // Remember only the opted-in email address; never store passwords or sessions in localStorage.
   try{if(remember)window.localStorage.setItem(emailKey,cleanEmail);else window.localStorage.removeItem(emailKey)}catch{}
   window.location.assign(safeReturnTo(returnTo,role));
  }catch{setError('Network error. Check your connection and try again.')}
  finally{setBusy(false)}
 }
 return <AuthLayout role={role}>
  <div className="mt-7 lg:mt-5"><p className="auth-eyebrow">{portal.eyebrow}</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--aero-ink)] sm:text-4xl">{portal.name}</h1>
   <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">Sign in securely to your Aerotech {role} workspace.</p></div>
  <nav aria-label="Choose sign-in role" className="mt-7 grid grid-cols-3 gap-2">{roles.map(option=><Link key={option} href={'/auth/login?'+new URLSearchParams({role:option,...(returnTo?{next:safeReturnTo(returnTo,option)}:{})})} aria-current={role===option?'page':undefined} onClick={()=>{setError('');setPassword('')}} className={'auth-portal-tab '+(role===option?'auth-portal-tab-active':'')}>{option[0].toUpperCase()+option.slice(1)} sign in</Link>)}</nav>
  {role==='employee'&&<p className="mt-4 text-sm text-slate-600">Your employer sends the invitation required to activate employee access.</p>}
  <noscript><p className="mt-4 text-sm text-red-700">JavaScript is required to sign in.</p></noscript>
  <form action={'/api/auth/login/'+role} method="post" onSubmit={signIn} className="mt-7 space-y-5" aria-busy={busy}>
   <div><label htmlFor="login-email" className="auth-field-label">Email address</label><div className="auth-field"><Mail size={18} aria-hidden className="auth-field-icon"/><input id="login-email" name="email" type="email" autoComplete="username" inputMode="email" maxLength={254} required disabled={busy} value={email} onChange={e=>{setEmail(e.target.value);if(error)setError('')}} placeholder={role==='employer'?'you@company.com':'you@example.com'} className="auth-input"/></div></div>
   <div><div className="flex items-center justify-between gap-3"><label htmlFor="login-password" className="auth-field-label">Password</label><Link href={'/auth/forgot-password?role='+role} className="auth-text-link text-sm font-semibold">Forgot password?</Link></div><div className="auth-field"><LockKeyhole size={18} aria-hidden className="auth-field-icon"/><input id="login-password" name="password" type={visible?'text':'password'} autoComplete="current-password" maxLength={256} required disabled={busy} value={password} onChange={e=>{setPassword(e.target.value);if(error)setError('')}} className="auth-input auth-input-password"/><button type="button" disabled={busy} aria-label={visible?'Hide password':'Show password'} aria-pressed={visible} onClick={()=>setVisible(v=>!v)} className="auth-password-toggle">{visible?<EyeOff size={19} aria-hidden/>:<Eye size={19} aria-hidden/>}</button></div></div>
   <div><label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-slate-700"><input type="checkbox" checked={remember} disabled={busy} onChange={e=>setRemember(e.target.checked)} className="h-4 w-4 accent-blue-700"/>Remember me</label><p className="ml-7 text-xs text-slate-500">Remember your email on this device, not your password or session.</p></div>
   <div aria-live="assertive" aria-atomic="true">{error&&<p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}</div>
   <button type="submit" disabled={busy} className="auth-submit">{busy?<><LoaderCircle size={20} aria-hidden className="animate-spin"/>Signing in…</>:<>Sign in<ArrowRight size={19} aria-hidden/></>}</button>
  </form>
  {portal.signup?<p className="mt-6 text-center text-sm text-slate-600">New to Aerotech? <Link className="auth-text-link font-bold" href={portal.signup+(returnTo?'?'+new URLSearchParams({next:safeReturnTo(returnTo,role)}):'')}>{portal.signupLabel}</Link></p>:<p className="mt-6 text-center text-sm text-slate-600">Need access? Ask your HR team for an activation invitation.</p>}
 </AuthLayout>;
}
