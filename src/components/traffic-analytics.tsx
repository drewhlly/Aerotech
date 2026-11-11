'use client';
import Script from 'next/script';
import {useEffect,useState} from 'react';
import {POLICY_VERSION} from '@/lib/policy';

// Optional GA4 tracking. Configure NEXT_PUBLIC_GA_MEASUREMENT_ID in production.
// Neither provider is loaded unless a visitor explicitly accepts analytics cookies.
const gaMeasurementId=process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || '';

export default function TrafficAnalytics(){
 const [enabled,setEnabled]=useState(false);
 useEffect(()=>{
  const sync=()=>{try{const saved=JSON.parse(localStorage.getItem('aerotech-cookie-choice')||'null');setEnabled(saved?.version===POLICY_VERSION&&saved?.choices?.analytics===true)}catch{setEnabled(false)}};
  queueMicrotask(sync);
  window.addEventListener('aerotech-cookie-choice',sync);
  window.addEventListener('storage',sync);
  return()=>{window.removeEventListener('aerotech-cookie-choice',sync);window.removeEventListener('storage',sync)};
 },[]);
 if(!enabled)return null;
 return <>
  <Script id="cloudflare-web-analytics" src="https://static.cloudflareinsights.com/beacon.min.js" strategy="afterInteractive" data-cf-beacon={JSON.stringify({token:"5c4153df82914b1988e153111990043d",spa:true})}/>
  {gaMeasurementId && <>
   <Script id="aerotech-ga4-library" src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`} strategy="afterInteractive"/>
   <Script id="aerotech-ga4-config" strategy="afterInteractive" dangerouslySetInnerHTML={{__html:`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(gaMeasurementId)},{'anonymize_ip':true});`}}/>
  </>}
 </>;
}
