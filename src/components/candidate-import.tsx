"use client";
import {useFeedback} from "@/components/use-feedback";
import { useState, type FormEvent } from "react";
export default function CandidateImport(){
 const [message,setMessage]=useFeedback();const [busy,setBusy]=useState(false);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setMessage("");
  const body=new FormData(event.currentTarget);
  try{const r=await fetch("/api/recruitment/import",{method:"POST",body});const result=await r.json();setMessage(r.ok?`Imported ${result.imported} applicants; skipped ${result.skipped} existing records.`:result.error||"Import failed");}
  catch{setMessage("Unable to upload file");}finally{setBusy(false);}
 }
 return <section className="mt-8 rounded-xl border bg-white p-6"><h2 className="text-xl font-bold">Bulk applicant import</h2><p className="mt-2 text-sm text-slate-500">Upload one Excel or CSV file with columns Full Name, Email, Phone, and Position. Up to 1,000 applicants per upload.</p><form method="post" onSubmit={submit} className="mt-5 flex flex-wrap gap-3"><input name="file" type="file" accept=".xlsx,.csv" required className="max-w-full rounded-lg border p-2"/><button disabled={busy} className="rounded-lg bg-slate-900 px-5 py-2 font-bold text-white disabled:opacity-50">{busy?"Importing...":"Import applicants"}</button></form>{message&&<p role="status" className="mt-3 text-sm">{message}</p>}</section>;
}
