"use client";
import {useCallback,useState} from 'react';
import {useEventRefresh,useExpiryClock} from './use-event-refresh';
import {eventVisible} from '@/lib/event-display';
type Person={first_name:string;last_name:string;department:string;expires_at:string};
export default function BirthdayTomorrow(){
 const [people,setPeople]=useState<Person[]>([]);
 const load=useCallback(async()=>{try{const r=await fetch('/api/hr/birthdays',{cache:'no-store'});if(!r.ok)return;const d=await r.json();setPeople(d.tomorrow||[])}catch{/* Expiry timers still clear stale reminders if refresh fails. */}},[]);
 useEventRefresh(load);
 const now=useExpiryClock(people.map(p=>p.expires_at)),visible=people.filter(p=>eventVisible(p.expires_at,now));
 if(!visible.length)return null;
 return <section className="aero-card my-5"><h2 className="text-lg font-bold">Tomorrow’s birthdays</h2><p className="mt-2 text-xs text-slate-500">A reminder for HR. Birth years are not displayed.</p>{visible.map((p,i)=><p className="mt-3 text-sm" key={i}>{p.first_name} {p.last_name} · {p.department}</p>)}</section>
}
