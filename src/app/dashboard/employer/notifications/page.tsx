'use client';
import {useEffect,useState} from 'react';
type Notice={id:string;title:string;body:string;read_at:string|null};
export default function Notifications(){
 const [rows,setRows]=useState<Notice[]>([]),[error,setError]=useState(''),[message,setMessage]=useState(''),[loading,setLoading]=useState(true),[saving,setSaving]=useState('');
 async function load(){try{const r=await fetch('/api/employer/alerts',{cache:'no-store'}),d=await r.json();if(!r.ok)throw Error(d.error||'Unable to load notifications');setRows(d.notifications)}finally{setLoading(false)}}
 useEffect(()=>{void Promise.resolve().then(load).catch(e=>setError(e.message))},[]);
 async function markRead(id:string){setSaving(id);setError('');setMessage('');try{const r=await fetch('/api/employer/alerts',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});if(!r.ok)throw Error('Unable to mark notification read');await load();setMessage('Notification marked as read.')}catch(e){setError(e instanceof Error?e.message:'Unable to update notification')}finally{setSaving('')}}
 return <div className="space-y-5"><section className="aero-hero"><h1 className="text-3xl font-bold">HR notifications</h1><p className="mt-3 text-slate-300">Day-before birthday reminders, document expiry alerts, due reviews and completed reports.</p></section>{loading&&<p role="status" className="aero-card">Loading notifications…</p>}{error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}{rows.map(r=><article className="aero-card" key={r.id}><h2 className="font-bold">{r.title}</h2><p className="mt-3 text-sm">{r.body}</p>{!r.read_at&&<button disabled={!!saving} className="aero-button mt-4 bg-blue-50 text-blue-700" onClick={()=>void markRead(r.id)}>{saving===r.id?'Saving…':'Mark read'}</button>}</article>)}{!loading&&!error&&!rows.length&&<p className="aero-card text-slate-500">No reminders from saved records yet.</p>}</div>
}
