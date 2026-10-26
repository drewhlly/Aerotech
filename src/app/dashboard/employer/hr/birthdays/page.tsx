"use client";
import BirthdayTomorrow from "@/components/birthday-tomorrow";
import { useEffect, useState } from "react";

type B={first_name:string;last_name:string;department:string;birthday:string};
type Alert={first_name:string;last_name:string;notified_at:string};
export default function Page(){
 const [items,setItems]=useState<B[]>([]);
 const [error,setError]=useState("");
 const [alerts,setAlerts]=useState<Alert[]>([]);
 useEffect(()=>{fetch("/api/hr/birthdays").then(async r=>{const x=await r.json();if(!r.ok)throw Error(x.error);setItems(x.birthdays||[]);setAlerts(x.hrAlerts||[])}).catch(e=>setError(e.message))},[]);
 return <main className="min-h-screen bg-slate-50 p-8">
 
 <h1 className="mt-5 text-3xl font-bold">Employee birthdays</h1><BirthdayTomorrow/>
 <p className="mt-2 text-slate-600">Birthdays from your employee records. Birth years stay private.</p>
 {error&&<p role="alert">{error}</p>}
 <section className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 p-5"><h2 className="font-bold">HR birthday reminders</h2><p className="mt-2 text-sm">Only the employer HR view receives these reminders. Staff do not receive birthday alerts.</p>{alerts.length?alerts.map((a,i)=><p className="mt-2" key={i}>Today: {a.first_name} {a.last_name}</p>):<p className="mt-2 text-sm">No birthday alerts logged today.</p>}</section>
 <div className="mt-6 grid gap-4 md:grid-cols-2">
 {items.map((b,i)=><article key={i} className="rounded-xl border bg-white p-5"><h2 className="font-bold">{b.first_name} {b.last_name}</h2><p>{b.department}</p><p className="mt-2 text-indigo-700">{b.birthday}</p></article>)}
 {items.length===0&&!error&&<p>No birthdays recorded yet.</p>}
 </div></main>;
}