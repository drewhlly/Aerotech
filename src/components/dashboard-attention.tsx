'use client';
import {useCallback,useState} from 'react';
import Link from 'next/link';
import {Skeleton,ErrorState} from './ui';
import {useEventRefresh,useExpiryClock} from './use-event-refresh';
import {eventVisible,meetingEnd} from '@/lib/event-display';
type Item={id:string;title:string;body?:string;starts_at?:string;expiry_date?:string;duration_minutes?:number;expires_at?:string|null};
type Data={meetings:Item[];documents:Item[];tasks:Item[];announcements:Item[];pipeline:{stage:string;count:number}[]};
export default function DashboardAttention({role}:{role:'employer'|'employee'}){
 const [data,setData]=useState<Data|null>(null),[error,setError]=useState('');
 const home=role==='employer'?'/dashboard/employer':'/employee';
 const load=useCallback(async()=>{try{const r=await fetch('/api/workspace/attention',{cache:'no-store'}),d=await r.json();if(!r.ok)throw Error(d.error);setData(d);setError('')}catch(e){setError(e instanceof Error?e.message:'Unable to load attention widgets')}},[]);
 useEventRefresh(load);
 const now=useExpiryClock([...(data?.meetings||[]).map(m=>m.starts_at?meetingEnd({...m,starts_at:m.starts_at}):null),...(data?.announcements||[]).map(n=>n.expires_at)]);
 const activeData=data?{...data,meetings:data.meetings.filter(m=>m.starts_at&&eventVisible(meetingEnd({...m,starts_at:m.starts_at}),now)),announcements:data.announcements.filter(n=>eventVisible(n.expires_at,now))}:null;
 const cards=[['meetings',role==='employee'?"Today’s meetings":'Upcoming meetings',home+'/meet'],['documents',role==='employee'?'Documents to acknowledge':'Expiring documents',home+'/documents'],['tasks',role==='employee'?'My learning tasks':'Workforce activity',role==='employee'?home+'/training':home+'/reports']] as const;
 const maximum=Math.max(1,...(data?.pipeline||[]).map(x=>x.count));
 // Preserve the same panel geometry before and after data arrives. Lists scroll
 // inside their panel so async content cannot displace the rest of the workday.
 return <section className="mt-6 space-y-6" aria-label="Needs attention"><h2 className="text-xl font-bold">Needs attention</h2>
 <div className="grid gap-4 lg:grid-cols-3">{cards.map(([key,label,href],index)=><article key={key} className="aero-card flex h-56 flex-col gap-4"><h3 className="font-bold">{label}</h3><div role="region" tabIndex={0} aria-label={label+' records'} className="min-h-0 flex-1 overflow-auto">{error?(index===0?<ErrorState message={error} retry={load}/>:<p className="text-sm text-slate-600">This view is temporarily unavailable.</p>):!data?<Skeleton label={'Loading '+label.toLowerCase()}/>:activeData![key].length?activeData![key].map(x=><div key={x.id} className="border-t py-2 text-sm"><p>{x.title}</p>{x.starts_at&&<time dateTime={x.starts_at}>{new Date(x.starts_at).toLocaleString()}</time>}{x.expiry_date&&<p>Expires {String(x.expiry_date).slice(0,10)}</p>}</div>):<p className="text-sm text-slate-600">Nothing requiring attention here.</p>}</div><Link href={href} className="aero-button border">Open {label.toLowerCase()}</Link></article>)}</div>
 {role==='employer'&&<article className="aero-card flex h-64 flex-col gap-4"><h3 className="font-bold">Applications by stage</h3><div role="region" tabIndex={0} aria-label="Hiring pipeline details" className="min-h-0 flex-1 overflow-auto">{!data&&!error?<Skeleton label="Loading hiring pipeline"/>:data?.pipeline.length?data.pipeline.map(x=><div key={x.stage} className="mt-4 grid grid-cols-[100px_1fr_40px] items-center gap-3 text-sm"><span className="capitalize">{x.stage}</span><progress className="w-full accent-blue-700" max={maximum} value={x.count} aria-label={x.stage+' applications'}/><span>{x.count}</span></div>):<p className="text-sm text-slate-600">{error?'The hiring pipeline is temporarily unavailable.':'Publish a role to start building your hiring pipeline.'}</p>}</div></article>}
 {role==='employee'&&<article className="aero-card flex h-48 flex-col gap-4"><h3 className="font-bold">Company updates</h3><div role="region" tabIndex={0} aria-label="Company update details" className="min-h-0 flex-1 overflow-auto">{!data&&!error?<Skeleton label="Loading company updates"/>:activeData?.announcements.length?activeData.announcements.map(x=><div key={x.id} className="border-t py-3 text-sm"><h4 className="font-semibold">{x.title}</h4><p className="mt-2">{x.body}</p></div>):<p className="text-sm text-slate-600">{error?'Company updates are temporarily unavailable.':'No company updates yet.'}</p>}</div></article>}

 </section>
}
