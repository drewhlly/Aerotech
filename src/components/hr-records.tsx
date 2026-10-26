"use client";
import {DashboardShell,PageHeader} from "@/components/aerotech-ui";
import {useCallback,useEffect,useState,type FormEvent} from "react";

const configs={
 assets:{title:"Employee assets",api:"assets",fields:[["name","Asset name"],["serial_number","Serial number"],["notes","Notes"]]},
 tasks:{title:"HR tasks",api:"tasks",fields:[["title","Task title"],["due_date","Due date"]]},
 disciplinary:{title:"Disciplinary cases",api:"disciplinary",fields:[["category","Category"],["description","Case details"]]},
} as const;
export default function Records({module}:{module:keyof typeof configs}){
 const c=configs[module];const [employees,setEmployees]=useState<Array<{id:string;first_name:string;last_name:string}>>([]);
 const [rows,setRows]=useState<Array<Record<string,unknown>>>([]),[values,setValues]=useState<Record<string,string>>({});
 const [error,setError]=useState(""),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[message,setMessage]=useState("");
 const load=useCallback(async()=>{setLoading(true);try{const [records,people]=await Promise.all([fetch('/api/hr/'+c.api),fetch('/api/employees')]);const data=await records.json(),staff=await people.json();if(!records.ok||!people.ok)throw Error(data.error||staff.error||'Unable to load records');setRows(data.records||[]);setEmployees(staff.employees||[])}catch(e){setError(e instanceof Error?e.message:'Unable to load records')}finally{setLoading(false)}},[c.api]);
 useEffect(()=>{void Promise.resolve().then(load)},[load]);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");setMessage("");try{
 const r=await fetch("/api/hr/"+c.api,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(values)});const d=await r.json();if(!r.ok)throw Error(d.error||"Unable to save");
 setValues({});setMessage("Record saved successfully.");await load();
 }catch(e){setError(e instanceof Error?e.message:"Unable to save");}finally{setBusy(false);}}
 return <DashboardShell title={c.title}><div className="mx-auto max-w-4xl"><PageHeader eyebrow="PEOPLE OPERATIONS" title={c.title} description="Manage records across your organisation." />
 <form method="post" onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border bg-white p-6"><h2 className="font-bold">New record</h2><label className="block text-sm">Employee<select required className="mt-2 block w-full rounded-lg border p-3" value={values.employeeId||""} onChange={e=>setValues(v=>({...v,employeeId:e.target.value}))}><option value="">Select employee</option>{employees.map(e=><option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}</select></label>
 {c.fields.map(([name,label])=><label key={name} className="block text-sm">{label}<input type={name==="due_date"?"date":"text"} required={name==="name"||name==="title"||name==="description"||name==="category"} className="mt-2 block w-full rounded-lg border p-3" value={values[name]||""} onChange={e=>setValues(v=>({...v,[name]:e.target.value}))}/></label>)}<button disabled={busy||loading||!employees.length} className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white">{busy?"Saving...":"Save record"}</button>{message&&<p role="status" className="text-green-700">{message}</p>}{error&&<p role="alert" className="text-red-700">{error}</p>}</form>
 <section className="mt-6 rounded-2xl border bg-white p-6"><h2 className="font-bold">Saved records</h2>{loading?<p role="status" className="mt-4 text-slate-600">Loading records…</p>:!rows.length?<p className="mt-4 text-slate-500">No records yet.</p>:rows.map(row=><div key={String(row.id)} className="border-b py-4"><p className="font-semibold">{String(row.name||row.title||row.category||"Record")}</p><p className="text-sm text-slate-500">{String(row.description||row.notes||"")}</p></div>)}</section></div></DashboardShell>;
}
