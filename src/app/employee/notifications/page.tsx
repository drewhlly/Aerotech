"use client";
import { useEffect, useState } from "react";

type Notification={id:string;title:string;body:string;created_at:string;read_at:string|null};
export default function Notifications(){
 const [items,setItems]=useState<Notification[]>([]),[error,setError]=useState("");
 async function reload(){const r=await fetch("/api/employee/notifications");const data=await r.json();if(!r.ok)throw Error(data.error||"Unable to load");setItems(data.notifications||[]);}
 useEffect(()=>{void Promise.resolve().then(()=>{void reload().catch(e=>setError(e.message));});},[]);
 async function markRead(id:string){const r=await fetch("/api/employee/notifications",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});if(!r.ok){setError("Could not mark notification read.");return;}await reload();}
 return <section className="mx-auto max-w-4xl p-6"><h1 className="mt-6 text-3xl font-bold">My notifications</h1>{error&&<p role="alert" className="mt-4 text-red-700">{error}</p>}<div className="mt-6 space-y-3">{items.length?items.map(item=><article key={item.id} className="rounded-2xl border bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-semibold">{item.title}</h2>{!item.read_at&&<button className="rounded-lg border px-3 py-2 text-xs" onClick={()=>markRead(item.id)}>Mark read</button>}</div><p className="mt-2 text-sm text-slate-700">{item.body}</p><p className="mt-2 text-xs text-slate-500">{new Date(item.created_at).toLocaleDateString()}</p></article>):<p className="rounded-xl border bg-white p-6 text-slate-500">No notifications yet.</p>}</div></section>;
}
