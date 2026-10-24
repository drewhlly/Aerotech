"use client";
import {useState,type FormEvent} from "react";
import Link from "next/link";
export default function AddEmployee(){
 const [values,setValues]=useState({firstName:"",lastName:"",email:"",phone:"",jobTitle:"",department:"",location:""});
 const [error,setError]=useState("");const [busy,setBusy]=useState(false);
 async function submit(event:FormEvent<HTMLFormElement>){
 event.preventDefault();setBusy(true);setError("");
 try{const r=await fetch("/api/employees",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(values)});const d=await r.json();if(!r.ok){setError(d.error||"Could not save employee");return;}window.location.assign(`/dashboard/employer/employees/${d.id}`);}
 catch{setError("Could not contact employee database");}finally{setBusy(false);}
 }
 return <main className="min-h-screen bg-slate-50 px-5 py-10"><div className="mx-auto max-w-xl"><Link href="/dashboard/employer/employees" className="underline">Back to employees</Link><div className="mt-6 rounded-2xl bg-white p-7 shadow-sm"><h1 className="text-2xl font-bold">Add employee</h1><p className="mt-2 text-sm text-slate-500">Employee details are saved to your organisation's database.</p><form onSubmit={submit} className="mt-6 space-y-4">{([{name:"firstName",label:"First name",required:true},{name:"lastName",label:"Last name",required:true},{name:"email",label:"Email",required:true},{name:"phone",label:"Phone",required:false},{name:"jobTitle",label:"Job title",required:true},{name:"department",label:"Department",required:true},{name:"location",label:"Location",required:false}] as const).map(f=><label key={f.name} className="block text-sm font-semibold">{f.label}<input type={f.name==="email"?"email":"text"} required={f.required} value={values[f.name]} onChange={e=>setValues(v=>({...v,[f.name]:e.target.value}))} className="mt-2 block w-full rounded-xl border p-3"/></label>)}{error&&<p role="alert" className="text-red-700">{error}</p>}<button disabled={busy} className="rounded-xl bg-slate-900 px-6 py-3 font-bold text-white disabled:opacity-50">{busy?"Saving...":"Save employee"}</button></form></div></div></main>;
}
