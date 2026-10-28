'use client';
import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import DataTable from './ui/data-table';
import {Skeleton,ErrorState} from './ui';
export default function Reports({compliance=false}:{compliance?:boolean}){
 const [currentTime,setCurrentTime]=useState(()=>Date.now());
 const [data,setData]=useState<Record<string,unknown>|null>(null),[error,setError]=useState('');
 const load=useCallback(async()=>{setError('');try{const r=await fetch('/api/employer/reports',{cache:'no-store'}),d=await r.json();if(!r.ok)throw Error(d.error);setData(d)}catch(e){setError(e instanceof Error?e.message:'Reports unavailable. Please retry.')}},[]);
 useEffect(()=>{const timer=setInterval(()=>setCurrentTime(Date.now()),60000);queueMicrotask(()=>void load());return()=>clearInterval(timer)},[load]);
 const sections=compliance?['documents']:['employees','training','attendance','requests','payroll'];
 const documents=(data?.documents||[]) as Record<string,unknown>[];
 const today=new Date(currentTime).toISOString().slice(0,10),soon=new Date(currentTime+30*86400000).toISOString().slice(0,10);
 const metrics=[['Expired',documents.filter(r=>r.expiry_date&&String(r.expiry_date).slice(0,10)<today).length],['Expiring in 30 days',documents.filter(r=>r.expiry_date&&String(r.expiry_date).slice(0,10)>=today&&String(r.expiry_date).slice(0,10)<=soon).length],['Awaiting acknowledgement',documents.filter(r=>!r.acknowledged_at).length]];
 return <div className="space-y-6"><header className="aero-hero"><h1 className="text-3xl font-bold">{compliance?'Document compliance':'Workforce reports'}</h1><p className="mt-3 text-sm text-slate-300">{compliance?'Expiry and acknowledgement records for your company documents.':'Reports generated from your saved company records. Attendance covers the last 30 days; other sections cover all saved records.'}</p></header>
 {compliance&&<Link className="aero-button bg-blue-700 text-white" href="/dashboard/employer/documents/new">Add a document record</Link>}
 {error?<ErrorState message={error} retry={load}/>:!data?<Skeleton label="Loading reports"/>:<>
 {compliance&&<><p className="aero-card text-sm leading-6">These metrics track document administration. Documents without an expiry date are excluded from expiry counts. Outstanding acknowledgement means no employee acknowledgement has been saved. These are not statutory compliance scores.</p><div className="grid gap-4 sm:grid-cols-3">{metrics.map(([label,count])=><article className="aero-card" key={label}><p className="text-sm text-slate-600">{label}</p><b className="mt-3 block text-3xl">{count}</b></article>)}</div></>}
 {sections.map(key=>{const raw=(data[key]||[]) as Record<string,unknown>[];const keys=Object.keys(raw[0]||{record:''}).filter(k=>k!=='id'&&k!=='external_url');const rows=raw.map((row,index)=>({...row,id:String(row.id||key+'-'+index)}));return <section key={key} className="aero-card"><h2 className="mb-4 text-xl font-bold capitalize">{key}</h2><DataTable<Record<string,unknown>&{id:string}> label={key[0].toUpperCase()+key.slice(1)+' report'} rows={rows} columns={keys.map(k=>({key:k,label:k.replaceAll('_',' ')}))}/></section>})}
 <p className="text-xs text-slate-600">Generated {new Date(String(data.generatedAt)).toLocaleString()}. Document tracking does not certify regulatory compliance.</p></>}
 </div>
}
