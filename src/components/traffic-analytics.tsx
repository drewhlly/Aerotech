'use client';
import Script from 'next/script';
import {useEffect,useState} from 'react';
import {POLICY_VERSION} from '@/lib/policy';

export default function TrafficAnalytics(){
 const [enabled,setEnabled]=useState(false);
 useEffect(()=>{
  const sync=()=>{try{const saved=JSON.parse(localStorage.getItem('aerotech-cookie-choice')||'null');setEnabled(saved?.version===POLICY_VERSION&&saved?.choices?.analytics===true)}catch{setEnabled(false)}};
  queueMicrotask(sync);
  window.addEventListener('aerotech-cookie-choice',sync);
  window.addEventListener('storage',sync);
  return()=>{window.removeEventListener('aerotech-cookie-choice',sync);window.removeEventListener('storage',sync)};
 },[]);
 return enabled?<Script id="cloudflare-web-analytics" src="https://static.cloudflareinsights.com/beacon.min.js" strategy="afterInteractive" data-cf-beacon={JSON.stringify({token:"5c4153df82914b1988e153111990043d",spa:true})}/>:null;
}
