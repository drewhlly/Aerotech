"use client";
import {useFeedback} from "@/components/use-feedback";
import {DashboardShell,PageHeader} from "@/components/aerotech-ui";
import {useCallback,useEffect,useState,type FormEvent} from "react";

import DataTable from './ui/data-table';
import {Skeleton,ErrorState} from './ui';
const configs={
 assets:{title:"Employee assets",api:"assets",fields:[["name","Asset name"],["serial_number","Serial number"],["notes","Notes"]]},
 tasks:{title:"HR tasks",api:"tasks",fields:[["title","Task title"],["due_date","Due date"]]},
 disciplinary:{title:"Disciplinary cases",api:"disciplinary",fields:[["category","Category"],["description","Case details"]]},
} as const;
export default function Records({module}:{module:keyof typeof configs}){
 const c=configs[module];const [employees,setEmployees]=useState<Array<{id:string;first_name:string;last_name:string}>>([]);
 const [rows,setRows]=useState<Array<Record<string,unknown>>>([]),[values,setValues]=useState<Record<string,string>>({});
 const [error,setError]=useState(""),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[message,setMessage]=useFeedback();
 const load=useCallback(async()=>{setLoading(true);setError("");try{const [records,people]=await Promise.all([fetch('/api/hr/'+c.api),fetch('/api/employees')]);const data=await records.json(),staff=await people.json();if(!records.ok||!people.ok)throw Error(data.error||staff.error||'Unable to load records');setRows(data.records||[]);setEmployees(staff.employees||[])}catch(e){setError(e instanceof Error?e.message:'Unable to load records')}finally{setLoading(false)}},[c.api]);
 useEffect(()=>{void Promise.resolve().then(load)},[load]);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");setMessage("");try{
 const r=await fetch("/api/hr/"+c.api,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(values)});const d=await r.json();if(!r.ok)throw Error(d.error||"Unable to save");
 setValues({});setMessage("Record saved successfully.");await load();
 }catch(e){setError(e instanceof Error?e.message:"Unable to save");}finally{setBusy(false);}}
 return <DashboardShell title={c.title}><div className="mx-auto max-w-4xl"><PageHeader eyebrow="PEOPLE OPERATIONS" title={c.title} description="Manage records across your organisation." />
 <form method="post" onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border bg-white p-6"><h2 className="font-bold">New record</h2><label className="block text-sm">Employee<select required className="mt-2 block w-full rounded-lg border p-3" value={values.employeeId||""} onChange={e=>setValues(v=>({...v,employeeId:e.target.value}))}><option value="">Select employee</option>{employees.map(e=><option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}</select></label>
 {c.fields.map(([name,label])=><label key={name} className="block text-sm">{label}{name==="category"?<select required className="aero-input mt-2" value={values[name]||""} onChange={e=>setValues(v=>({...v,[name]:e.target.value}))}><option value="">Select category</option>{["Attendance","Conduct","Performance","Policy violation","Other"].map(x=><option key={x}>{x}</option>)}</select>:<input type={name==="due_date"?"date":"text"} required={name==="name"||name==="title"||name==="description"} className="mt-2 block w-full rounded-lg border p-3" value={values[name]||""} onChange={e=>setValues(v=>({...v,[name]:e.target.value}))}/>}</label>)}<button disabled={busy||loading||!employees.length} className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white">{busy?"Saving...":"Save record"}</button>{message&&<p role="status" className="text-green-700">{message}</p>}{error&&<p role="alert" className="text-red-700">{error}</p>}</form>
 <section className="aero-card mt-6"><h2 className="mb-4 text-xl font-bold">Saved records</h2>{loading?<Skeleton label="Loading records"/>:error?<ErrorState message={error} retry={load}/>:<DataTable label={c.title} rows={rows.map(row=>({...row,id:String(row.id),record:String(row.name||row.title||row.category||'Record'),details:String(row.description||row.notes||''),employee:employees.filter(e=>e.id===row.employee_id).map(e=>e.first_name+' '+e.last_name).join(''),status:String(row.status||'Recorded')}))} columns={[{key:'record',label:'Record'},{key:'employee',label:'Employee'},{key:'details',label:'Details'},{key:'status',label:'Status'}]}/>}</section></div></DashboardShell>;
}
