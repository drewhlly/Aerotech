"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
type Statement={run_id:string;payroll_month:string;gross:string;paye:string;pension:string;nhf:string;sanctions:string;other_deductions:string;net:string};
export default function Statements(){
 const [rows,setRows]=useState<Statement[]>([]),[error,setError]=useState("");
 useEffect(()=>{fetch("/api/employee/payroll/statements",{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error||"Unavailable");setRows(d.statements||[])}).catch(e=>setError(e.message))},[]);
 const fmt=(v:string)=>"₦"+Number(v).toLocaleString("en-NG",{minimumFractionDigits:2,maximumFractionDigits:2});
 return <main className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-4xl"><h1 className="mt-5 text-3xl font-bold">My payroll statements</h1><p className="mt-2 text-sm text-slate-600">Only your fully approved statements are displayed. Approval does not mean salary has been paid.</p>{error&&<p role="alert" className="mt-5 text-red-700">{error}</p>}<div className="mt-6 space-y-4">{rows.map(r=><article key={r.run_id} className="rounded-xl border bg-white p-5"><h2 className="font-bold">{String(r.payroll_month).slice(0,7)}</h2><div className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><p>Gross: {fmt(r.gross)}</p><p>PAYE: {fmt(r.paye)}</p><p>Pension: {fmt(r.pension)}</p><p>NHF: {fmt(r.nhf)}</p><p>Sanctions: {fmt(r.sanctions)}</p><p>Other deductions: {fmt(r.other_deductions)}</p><p className="font-semibold">Net: {fmt(r.net)}</p></div></article>)}{!rows.length&&!error&&<p className="rounded-xl border bg-white p-5">No approved payroll statements are available.</p>}</div></div></main>;
}
