"use client";
import {useState,type FormEvent} from "react";
import Link from "next/link";
export default function ImportEmployees(){
 const [file,setFile]=useState<File|null>(null),[busy,setBusy]=useState(false),[result,setResult]=useState(""),[errors,setErrors]=useState<string[]>([]);
 async function upload(e:FormEvent){e.preventDefault();if(!file)return;setBusy(true);setResult("");setErrors([]);
 try{const body=new FormData();body.set("file",file);const res=await fetch("/api/employees/import",{method:"POST",body});const data=await res.json();if(!res.ok){setErrors(Array.isArray(data.details)?data.details:[]);throw Error(data.error||"Import failed")}setResult(data.imported+" employees imported successfully.");}
 catch(e){setResult(e instanceof Error?e.message:"Import failed")}finally{setBusy(false)}
 }
 return <main className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-3xl"><Link href="/dashboard/employer/employees" className="text-sm underline">Back to employees</Link><h1 className="mt-6 text-3xl font-bold">Import employees from CSV</h1><p className="mt-3 text-slate-600">Upload up to 1,000 employees in one CSV file. Required columns: first_name, last_name, email, job_title, department. Optional: phone, location, date_of_birth (YYYY-MM-DD). The import rejects duplicates and saves all rows together only when valid.</p><form onSubmit={upload} className="mt-6 space-y-4 rounded-xl border bg-white p-6"><label className="block font-semibold">Choose CSV file<input type="file" accept=".csv,text/csv" required className="mt-2 block w-full" onChange={e=>setFile(e.target.files?.[0]||null)}/></label><button type="submit" disabled={!file||busy} className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy?"Importing…":"Import employees"}</button></form>{result&&<p role="status" className="mt-4">{result}</p>}{errors.length>0&&<ul role="alert" className="mt-3 list-disc pl-6 text-red-700">{errors.map((e,i)=><li key={i}>{e}</li>)}</ul>}</div></main>;
}
