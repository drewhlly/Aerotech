"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
type B={first_name:string;last_name:string;department:string;birthday:string};
export default function Page(){
 const [items,setItems]=useState<B[]>([]);
 const [error,setError]=useState("");
 useEffect(()=>{fetch("/api/hr/birthdays").then(async r=>{const x=await r.json();if(!r.ok)throw Error(x.error);setItems(x.birthdays||[])}).catch(e=>setError(e.message))},[]);
 return <main className="min-h-screen bg-slate-50 p-8">
 <Link href="/dashboard/employer">Back to dashboard</Link>
 <h1 className="mt-5 text-3xl font-bold">Employee birthdays</h1>
 <p className="mt-2 text-slate-600">Birthdays from your employee records. Birth years stay private.</p>
 {error&&<p role="alert">{error}</p>}
 <div className="mt-6 grid gap-4 md:grid-cols-2">
 {items.map((b,i)=><article key={i} className="rounded-xl border bg-white p-5"><h2 className="font-bold">{b.first_name} {b.last_name}</h2><p>{b.department}</p><p className="mt-2 text-indigo-700">{b.birthday}</p></article>)}
 {items.length===0&&!error&&<p>No birthdays recorded yet.</p>}
 </div></main>;
}