"use client";
import {useEffect,useState} from 'react';
export default function Tomorrow(){
 const [people,setPeople]=useState<{first_name:string;last_name:string;department:string}[]>([]);
 useEffect(()=>{let alive=true;async function load(){try{const r=await fetch('/api/hr/birthdays',{cache:'no-store'});if(!r.ok)return;const d=await r.json();if(alive)setPeople(d.tomorrow||[])}catch{/* Keep the last successful view until the next refresh. */}}void load();const timer=window.setInterval(load,60000);window.addEventListener('focus',load);return()=>{alive=false;window.clearInterval(timer);window.removeEventListener('focus',load)}},[]);
 if(!people.length)return null;
 return <section className="aero-card my-5"><h2 className="text-lg font-bold">Tomorrow’s birthdays</h2><p className="mt-2 text-xs text-slate-500">A reminder for HR. Birth years are not displayed.</p>{people.map((p,i)=><p className="mt-3 text-sm" key={i}>{p.first_name} {p.last_name} · {p.department}</p>)}</section>
}