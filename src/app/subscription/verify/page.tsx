"use client";
import {useEffect,useState,Suspense} from "react";
import {useSearchParams} from "next/navigation";
import Link from "next/link";
function Verify(){const params=useSearchParams();const reference=params.get("reference");const [message,setMessage]=useState("Verifying your payment...");
 async function verify(){try{const r=await fetch("/api/subscription/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reference})});const d=await r.json();if(!r.ok)throw Error(d.error);window.location.assign("/dashboard/employer");}catch(e){setMessage(e instanceof Error?e.message:"Unable to verify payment.");}}
 useEffect(()=>{void verify();},[reference]);
 return <main className="mx-auto max-w-xl p-8"><h1 className="text-2xl font-bold">Employer subscription</h1><p role="status" className="mt-4">{message}</p><button onClick={verify} className="mt-4 rounded-lg bg-slate-900 p-3 text-white">Retry verification</button><Link href="/pricing" className="ml-4 underline">Back to plans</Link></main>;}
export default function Page(){return <Suspense fallback={<p>Loading payment...</p>}><Verify/></Suspense>;}
