'use client';
import {useCallback,useState} from 'react';
import {useEventRefresh,useExpiryClock} from './use-event-refresh';
import {eventVisible} from '@/lib/event-display';
type Birthday={first_name:string;last_name:string;department:string;celebration_date:string;expires_at:string};
export default function BirthdayCalendar({role}:{role:'employer'|'employee'}){
 const [people,setPeople]=useState<Birthday[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 const load=useCallback(async()=>{try{const response=await fetch(role==='employer'?'/api/hr/birthdays':'/api/employee/birthdays',{cache:'no-store'}),data=await response.json();if(!response.ok)throw Error(data.error||'Unable to load birthdays');setPeople(data.birthdays||[]);setError('')}catch(e){setError((e as Error).message)}finally{setLoading(false)}},[role]);
 useEventRefresh(load);
 const now=useExpiryClock(people.map(p=>p.expires_at));
 const visible=people.filter(p=>eventVisible(p.expires_at,now));
 return <section className="space-y-6"><header><h1 className="text-3xl font-bold">{role==='employer'?'Employee birthdays':'Team birthdays'}</h1><p className="mt-2 text-sm text-slate-600">Today and tomorrow only. Past birthdays clear automatically at midnight, Lagos time. Birth years stay private.</p></header>{error&&<p role="alert" className="aero-card">{error}<button className="aero-button border ml-3" onClick={()=>void load()}>Retry</button></p>}{loading&&<p role="status">Loading birthdays…</p>}<div className="grid gap-4 md:grid-cols-2">{visible.map((person,i)=><article key={person.celebration_date+person.first_name+i} className="aero-card"><h2 className="font-bold">{person.first_name} {person.last_name}</h2><p className="mt-1 text-sm text-slate-600">{person.department}</p><p className="mt-3 font-semibold text-blue-700"><time dateTime={String(person.celebration_date).slice(0,10)}>{new Date(String(person.celebration_date).slice(0,10)+'T12:00:00+01:00').toLocaleDateString('en-GB',{timeZone:'Africa/Lagos',day:'numeric',month:'long'})}</time></p></article>)}</div>{!visible.length&&!loading&&!error&&<p className="aero-card">No birthdays today or tomorrow. The next celebration will appear automatically.</p>}</section>;
}
