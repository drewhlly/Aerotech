'use client';
import {useFeedback} from '@/components/use-feedback';
import {useEffect,useState} from 'react';
import {POLICY_VERSION} from '@/lib/policy';

type Choices={preferences:boolean;analytics:boolean;marketing:boolean};
const defaults:Choices={preferences:false,analytics:false,marketing:false};
export default function CookieNotice({embedded=false}:{embedded?:boolean}){
 const [visible,setVisible]=useState(false),[prefs,setPrefs]=useState<Choices>(defaults),[busy,setBusy]=useState(false),[message,setMessage]=useFeedback();
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem('aerotech-cookie-choice')||'null');queueMicrotask(()=>{if(saved?.version===POLICY_VERSION){setPrefs(saved.choices);setVisible(false)}else if(!embedded)setVisible(true)})}catch{if(!embedded)queueMicrotask(()=>setVisible(true))}},[embedded]);
 async function save(choices:Choices){setBusy(true);try{const r=await fetch('/api/privacy/cookies',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...choices,version:POLICY_VERSION})});if(!r.ok)throw Error();try{localStorage.setItem('aerotech-cookie-choice',JSON.stringify({version:POLICY_VERSION,choices}))}catch{}setPrefs(choices);setMessage('Preferences saved.');setVisible(false)}catch{setMessage('Unable to save. Only essential cookies remain enabled; please retry.')}finally{setBusy(false)}}
 if(!visible)return embedded?<button type="button" className="aero-button border" onClick={()=>setVisible(true)}>Edit cookie preferences</button>:null;
 return <section aria-label="Cookie preferences" className={embedded?'aero-card space-y-4':'fixed bottom-4 left-4 right-4 z-50 mx-auto max-h-[calc(100dvh-2rem)] max-w-3xl space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-[0_20px_65px_rgba(7,21,44,0.25)] sm:bottom-6 sm:p-6'}>
  <h2 className="text-xl font-bold">Your cookie choices</h2><p className="text-sm leading-6 text-slate-600">Essential session and security cookies are always active. Optional categories are off unless you choose them. No advertising or analytics services are currently installed; selecting a category does not install a service.</p>
  <div className="flex flex-wrap gap-x-5 gap-y-1">{(['preferences','analytics','marketing'] as const).map(k=><label className="flex min-h-11 items-center gap-3 text-sm capitalize" key={k}><input type="checkbox" checked={prefs[k]} onChange={e=>setPrefs({...prefs,[k]:e.target.checked})}/>{k}</label>)}</div>
  <div className="flex flex-wrap gap-3"><button type="button" disabled={busy} className="aero-button border" onClick={()=>void save(defaults)}>Reject optional cookies</button><button type="button" disabled={busy} className="aero-button bg-blue-700 text-white" onClick={()=>void save(prefs)}>{busy?'Saving…':'Save choices'}</button><button type="button" disabled={busy} className="aero-button border" onClick={()=>void save({preferences:true,analytics:true,marketing:true})}>Accept all</button></div>
  {message&&<p role="status" className="text-sm">{message}</p>}
 </section>
}
