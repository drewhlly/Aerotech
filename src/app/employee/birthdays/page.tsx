"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
type Birthday={first_name:string;last_name:string;department:string;birthday:string};
export default function EmployeeBirthdays(){
 const [people,setPeople]=useState<Birthday[]>([]);
 const [error,setError]=useState("");
 useEffect(()=>{fetch("/api/employee/birthdays").then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error||"Unavailable");setPeople(data.birthdays||[])}).catch(e=>setError(e.message))},[]);
 return <main className="min-h-screen bg-slate-50 p-8"><h1 className="mt-5 text-3xl font-bold">Team birthdays</h1><p className="mt-2 text-slate-600">See your colleagues' birthdays. Birth years are private.</p>{error&&<p role="alert">{error}</p>}<div className="mt-6 grid gap-4 md:grid-cols-2">{people.map((person,i)=><article key={i} className="rounded-xl border bg-white p-5"><h2 className="font-bold">{person.first_name} {person.last_name}</h2><p className="text-sm text-slate-600">{person.department}</p><p className="mt-2 text-indigo-700">{person.birthday}</p></article>)}{!people.length&&!error&&<p>No birthdays recorded yet.</p>}</div></main>;
}