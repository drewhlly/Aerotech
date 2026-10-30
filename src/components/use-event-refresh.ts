'use client';
import {useEffect,useState} from 'react';
/** Refresh on resume too: mobile browsers suspend interval timers in background tabs. */
export function useEventRefresh(load: () => void | Promise<void>) {
 useEffect(()=>{
  const refresh=()=>void load();
  const visible=()=>{if(document.visibilityState==='visible')refresh()};
  queueMicrotask(refresh);
  const timer=window.setInterval(refresh,30000);
  window.addEventListener('focus',refresh);
  window.addEventListener('aerotech-notifications-changed',refresh);
  document.addEventListener('visibilitychange',visible);
  return()=>{window.clearInterval(timer);window.removeEventListener('focus',refresh);window.removeEventListener('aerotech-notifications-changed',refresh);document.removeEventListener('visibilitychange',visible)};
 },[load]);
}
/** One timer at the next expiry, rather than polling/re-rendering every second. */
export function useExpiryClock(deadlines: (string|null|undefined)[]) {
 const [now,setNow]=useState(()=>Date.now());
 const key=deadlines.filter(Boolean).join('|');
 useEffect(()=>{queueMicrotask(()=>setNow(Date.now()))},[key]);
 useEffect(()=>{
  const update=()=>setNow(Date.now());
  const current=Date.now();
  const next=Math.min(...key.split('|').map(Date.parse).filter(t=>Number.isFinite(t)&&t>current));
  const timer=Number.isFinite(next)?window.setTimeout(update,Math.min(next-current+1,2147483647)):undefined;
  window.addEventListener('focus',update);
  document.addEventListener('visibilitychange',update);
  return()=>{window.clearTimeout(timer);window.removeEventListener('focus',update);document.removeEventListener('visibilitychange',update)};
 },[key,now]);
 return now;
}
