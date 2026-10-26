"use client";
import {useRouter} from 'next/navigation';

import PasswordInput from "@/components/password-input";
import {Suspense,useState,type FormEvent} from "react";
import {useSearchParams} from "next/navigation";
function ActivationForm(){const router=useRouter();
 const search=useSearchParams();const token=search.get("token")||"";
 const [password,setPassword]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");
 try{const response=await fetch("/api/auth/activate/employee",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,password})});const data=await response.json();if(!response.ok)throw Error(data.error||"Activation failed");router.replace("/employee");router.refresh();}catch(e){setError(e instanceof Error?e.message:"Unable to activate account");}finally{setBusy(false);}}
 return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5"><section className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm"><h1 className="text-2xl font-bold">Activate your Aerotech account</h1><p className="mt-3 text-sm text-slate-600">Your employer invited you. Create a secure password to access employee self-service.</p>{!token?<p className="mt-5 text-red-700">Use the activation link provided by HR.</p>:<form method="post" className="mt-6 space-y-4" onSubmit={submit}><label className="block text-sm font-semibold">New password<PasswordInput type="password" minLength={12} required autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label>{error&&<p role="alert" className="text-red-700">{error}</p>}<button disabled={busy} className="w-full rounded-xl bg-slate-900 p-3 font-semibold text-white">{busy?"Activating...":"Activate account"}</button></form>}</section></main>;
}

export default function ActivateEmployee(){return <Suspense fallback={<main className="p-8">Loading activation form...</main>}><ActivationForm/></Suspense>;}
