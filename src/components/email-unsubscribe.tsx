'use client';
import {useState} from 'react';
export default function EmailUnsubscribe({token}:{token:string}){
 const [busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState('');
 async function unsubscribe(){setBusy(true);setError('');try{const r=await fetch('/api/communications/unsubscribe?token='+encodeURIComponent(token),{method:'POST'});if(!r.ok)throw Error('We could not save your choice. Please retry.');setDone(true)}catch(e){setError(e instanceof Error?e.message:'Please retry.')}finally{setBusy(false)}}
 return <main className="mx-auto min-h-[60vh] max-w-xl px-5 py-20"><section className="aero-card"><h1 className="text-3xl font-semibold">{done?'You’re unsubscribed':'Your email choices'}</h1><p className="mt-4 leading-7 text-slate-600">{done?'Optional job alerts, newsletters, and product emails have been switched off. You can opt in again from Email preferences in your workspace.':'Stop optional Aerotech emails. Essential account, security, and service notices will continue.'}</p>{!done&&<button onClick={unsubscribe} disabled={busy||!token} className="aero-button mt-6 bg-blue-700 text-white">{busy?'Updating…':'Unsubscribe from optional emails'}</button>}{error&&<p role="alert" className="mt-4 text-red-700">{error}</p>}</section></main>;
}
