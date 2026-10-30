"use client";
import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {Bell} from 'lucide-react';
import {useEventRefresh,useExpiryClock} from './use-event-refresh';
import {eventVisible} from '@/lib/event-display';
type Notice={read_at:string|null;expires_at?:string|null};
export default function NotificationBell({role='employee'}:{role?:'employee'|'employer'}){
 const [notices,setNotices]=useState<Notice[]>([]),[extra,setExtra]=useState(0),[nextExpiry,setNextExpiry]=useState<string|null>(null);
 const refresh=useCallback(async()=>{
  try{
   const [primary,collaboration]=await Promise.all([
    fetch(role==='employee'?'/api/employee/notifications':'/api/employer/alerts',{cache:'no-store'}),
    fetch('/api/collaboration/notifications?limit=1',{cache:'no-store'})
   ]);
   if(primary.ok)setNotices((await primary.json()).notifications);
   if(collaboration.ok){const d=await collaboration.json();setExtra(d.unread);setNextExpiry(d.nextExpiry||null)}
  }catch{/* Keep the last successful count; known expiry timers still apply. */}
 },[role]);
 useEventRefresh(refresh);
 const now=useExpiryClock([...notices.map(n=>n.expires_at),nextExpiry]);
 useEffect(()=>{if(nextExpiry&&!eventVisible(nextExpiry,now))queueMicrotask(()=>void refresh())},[now,nextExpiry,refresh]);
 // At a collaboration expiry, suppress its stale count until the next server refresh.
 const count=notices.filter(n=>!n.read_at&&eventVisible(n.expires_at,now)).length+(eventVisible(nextExpiry,now)?extra:0);
 return <Link href={role==='employee'?'/employee/notifications':'/dashboard/employer/notifications'} aria-label={'Notifications, '+count+' unread'} className="relative rounded-xl p-3 text-slate-600 hover:bg-blue-50"><Bell size={21}/>{count>0&&<span className="absolute -right-1 -top-1 rounded-full bg-blue-600 px-1.5 text-[10px] text-white">{count>99?'99+':count}</span>}</Link>
}
