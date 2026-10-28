"use client";
import {useEffect,useState} from "react";import Link from "next/link";import {api} from "./collaboration-client";
export default function ProjectFiles({projectId,base}:{projectId:string;base:string}){
 const [records,setRecords]=useState<{id:string;title:string;category:string}[]>([]),[offset,setOffset]=useState(0),[error,setError]=useState("");
 useEffect(()=>{let active=true;void api<{records:typeof records}>(`/api/projects/${projectId}/files?limit=20&offset=${offset}`).then(d=>{if(active){setRecords(d.records);setError("")}}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[projectId,offset]);
 return <section className="aero-card space-y-3"><h2 className="text-lg font-bold">Project files</h2><p className="text-sm text-slate-600">Task attachments shared with you.</p>{error&&<p role="alert">{error}</p>}{records.map(d=><div key={d.id}><Link className="text-blue-700 underline" href={`${base}/documents?document=${d.id}`}>{d.title}</Link><p className="text-sm">{d.category}</p></div>)}{!records.length&&!error&&<p>No shared files yet.</p>}<div className="flex gap-3"><button className="aero-button border" disabled={!offset} onClick={()=>setOffset(n=>Math.max(0,n-20))}>Previous files</button><button className="aero-button border" disabled={records.length<20} onClick={()=>setOffset(n=>n+20)}>More files</button></div></section>
}
