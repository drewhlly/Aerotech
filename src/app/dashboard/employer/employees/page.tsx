"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
type Employee={id:string;first_name:string;last_name:string;email:string;job_title:string;department:string;location:string|null;employment_status:string};
export default function EmployeesPage(){
 const [employees,setEmployees]=useState<Employee[]>([]);const [error,setError]=useState("");const [loading,setLoading]=useState(true);
 useEffect(()=>{fetch("/api/employees").then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error||"Unable to load employees");setEmployees(d.employees)}).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
 return <main className="min-h-screen bg-slate-50 p-6 lg:p-10"><div className="mx-auto max-w-6xl">
  <div className="flex items-center justify-between gap-3"><div><h1 className="text-3xl font-bold">Employees</h1><p className="mt-2 text-sm text-slate-500">Your organisation's saved employee records</p></div><Link href="/dashboard/employer/employees/new" className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white">Add employee</Link></div>
  <div className="mt-8 overflow-hidden rounded-2xl border bg-white">
   {loading?<p className="p-6">Loading employee records...</p>:error?<p role="alert" className="p-6 text-red-700">{error}</p>:employees.length===0?<p className="p-6 text-slate-500">No employee records yet. Add your first employee to get started.</p>:employees.map(e=><Link key={e.id} href={`/dashboard/employer/employees/${e.id}`} className="flex items-center justify-between border-b p-5 hover:bg-slate-50"><div><p className="font-bold">{e.first_name} {e.last_name}</p><p className="mt-1 text-sm text-slate-500">{e.job_title} · {e.department} · {e.location||"Location not set"}</p></div><span className="text-sm text-slate-600">{e.employment_status}</span></Link>)}
  </div></div></main>;
}
