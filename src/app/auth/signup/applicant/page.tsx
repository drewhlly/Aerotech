"use client";
import PolicyAcceptance from '@/components/policy-acceptance';
import {POLICY_VERSION} from '@/lib/policy';
import Link from "next/link";
import { useState, type FormEvent } from "react";
import PasswordInput from "@/components/password-input";
import {safeReturnTo} from "@/lib/auth-navigation";
import CountrySelect from '@/components/country-select';
export default function ApplicantSignup() {
 const [form,setForm]=useState({firstName:"",lastName:"",email:"",phone:"",country:"Nigeria",password:""});
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 async function submit(event:FormEvent<HTMLFormElement>) {
  event.preventDefault();setError("");setBusy(true);
  try {
   const response=await fetch("/api/auth/signup/applicant",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,acceptedPolicies:true,policyVersion:POLICY_VERSION})});
   const data=await response.json().catch(()=>({}));
   if(!response.ok){setError(data.error||"Registration failed.");return;}
   window.location.assign(safeReturnTo(new URLSearchParams(window.location.search).get('next'),'applicant'));
  }catch{setError("Unable to connect right now.");}finally{setBusy(false);}
 }
 return <main className="min-h-screen bg-[#F5F8FA] px-5 py-8">
  <div className="mx-auto max-w-xl"><div className="mt-12 rounded-3xl bg-white p-8 shadow-sm">
   <h1 className="text-3xl font-black text-[#07152c]">Create your free account</h1>
   <p className="mt-3 text-slate-600">Create your own account to discover jobs and apply across companies. No employer invitation or payment is required.</p>
   <form method="post" onSubmit={submit} className="mt-7 space-y-4">
    {([{name:"firstName",label:"First name",type:"text"},{name:"lastName",label:"Last name",type:"text"},{name:"email",label:"Email",type:"email"},{name:"phone",label:"Phone",type:"tel"},{name:"password",label:"Password (12+ characters)",type:"password"}] as const).map(field=><label key={field.name} className="block text-sm font-semibold text-slate-700">{field.label}{field.name==='password'?<PasswordInput required minLength={12} autoComplete="new-password" value={form.password} onChange={e=>setForm(v=>({...v,password:e.target.value}))} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5"/>:(<input autoComplete={field.name==="email"?"email":field.name==="firstName"?"given-name":field.name==="lastName"?"family-name":"tel"} type={field.type} required  value={form[field.name]} onChange={e=>setForm(v=>({...v,[field.name]:e.target.value}))} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5"/>)}</label>)}
    <label className="block text-sm font-semibold text-slate-700">Country<CountrySelect required value={form.country} onChange={e=>setForm(v=>({...v,country:e.target.value}))} className="aero-input mt-2"/></label>
    {error&&<p role="alert" className="text-sm text-red-700">{error}</p>}
    <button type="submit" disabled={busy} className="w-full rounded-xl bg-[#07152c] p-4 font-bold text-white disabled:opacity-50">{busy?"Creating account...":"Create free account"}</button>
   <PolicyAcceptance/></form>
   <Link href="/auth/login?role=applicant" className="mt-5 block text-center text-sm font-bold text-[#2563eb]">Already registered? Sign in</Link>
  </div></div>
 </main>;
}
