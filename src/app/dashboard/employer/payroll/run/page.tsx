"use client";

import Link from "next/link";
import {useEffect,useState} from "react";

type PayrollResult = {runId:string;status:string;gross:number;deductions:number;net:number;paye:number;employerPension:number};
const money=(value:number)=>new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN"}).format(value);
export default function PayrollRunPage(){
 const [month,setMonth]=useState(new Date().toISOString().slice(0,7));
 const [result,setResult]=useState<PayrollResult|null>(null);
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const [setup,setSetup]=useState<{employees:number;ready:number;missing:number}|null>(null);
 useEffect(()=>{fetch('/api/payroll/compensation').then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);setSetup({employees:d.employees.length,ready:d.employees.filter((p:{payroll_id:string|null;active:boolean})=>p.payroll_id&&p.active).length,missing:d.employees.filter((p:{payroll_id:string|null})=>!p.payroll_id).length})}).catch(e=>setError(e.message))},[]);
 async function prepare(){
  setBusy(true);setError("");setResult(null);
  try{
   const response=await fetch("/api/payroll/run",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({month})});
   const body=await response.json();
   if(!response.ok)throw new Error(body.error||"Unable to prepare payroll");
   setResult(body as PayrollResult);
  }catch(e){setError(e instanceof Error?e.message:"Payroll request failed");}
  finally{setBusy(false);}
 }
 return <section className="min-h-screen bg-slate-50 p-6 text-slate-900">
  <div className="mx-auto max-w-3xl space-y-6">
   
   <header><h1 className="text-2xl font-bold">Prepare payroll</h1><p className="mt-2 text-sm text-slate-600">Calculate a payroll draft from your company’s active payroll employees and approved deductions. No funds will be transferred.</p></header>
   <section className="aero-card"><h2 className="font-bold">Employee compensation</h2><p className="mt-2 text-sm text-slate-600">{setup?`${setup.ready} on payroll · ${setup.missing} need setup`:'Checking payroll setup…'}</p><Link href="/dashboard/employer/payroll/setup" className="mt-3 inline-block font-semibold text-blue-700">Review employees & set up salaries →</Link></section>
   <section className="rounded-xl border bg-white p-6">
    <label htmlFor="payroll-month" className="block text-sm font-semibold">Payroll month</label>
    <input id="payroll-month" type="month" min="2026-01" required value={month} onChange={e=>setMonth(e.target.value)} className="mt-2 block rounded-lg border p-3"/>
    <button type="button" onClick={prepare} disabled={busy||!setup||setup.ready===0||setup.missing>0||!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)} className="mt-5 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy?"Preparing...":"Prepare payroll draft"}</button>
    {error&&<p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
   </section>
   {!result&&!busy&&<p className="aero-card text-sm text-slate-500">Select a period to prepare payroll from your saved employee compensation records.</p>}
   {result&&<section aria-live="polite" className="rounded-xl border bg-white p-6">
    <h2 className="text-lg font-bold">Payroll draft created</h2>
    <p className="mt-2 text-sm text-slate-600">Reference: {result.runId}</p>
    <dl className="mt-4 space-y-3 text-sm">{([["Gross pay",result.gross],["Deductions",result.deductions],["PAYE",result.paye],["Employer pension",result.employerPension],["Net pay",result.net]] as const).map(([label,value])=><div key={label} className="flex justify-between border-b pb-2"><dt>{label}</dt><dd className="font-semibold">{money(value)}</dd></div>)}</dl>
    <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Status: {result.status}. HR, Finance and CEO must review this draft through their assigned accounts. Salary transfers are not enabled. This is not a payment confirmation.</p>
   </section>}
  </div>
 </section>;
}
