'use client';
import {useEffect,useRef,useState} from 'react';
const metrics=[
 {label:'Organisations served',value:process.env.NEXT_PUBLIC_CLIENTS_SERVED},
 {label:'Professionals placed',value:process.env.NEXT_PUBLIC_PROFESSIONALS_PLACED},
 {label:'Years in business',value:process.env.NEXT_PUBLIC_YEARS_IN_BUSINESS},
];
function Metric({value,label}:{value?:string;label:string}){
 const number=value&&/^\d+$/.test(value)?Number(value):null;
 const ref=useRef<HTMLDivElement>(null),[visible,setVisible]=useState(false),[count,setCount]=useState(0),[reduced,setReduced]=useState(false);
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setReduced(media.matches);change();media.addEventListener('change',change);return()=>media.removeEventListener('change',change)},[]);
 useEffect(()=>{const el=ref.current;if(!el)return;const observer=new IntersectionObserver(entries=>{if(entries[0]?.isIntersecting){setVisible(true);observer.disconnect()}},{threshold:.3});observer.observe(el);return()=>observer.disconnect()},[]);
 useEffect(()=>{if(!visible||number===null)return;if(reduced){const id=window.requestAnimationFrame(()=>setCount(number));return()=>window.cancelAnimationFrame(id)}let frame=0;const duration=800,start=performance.now();const tick=(now:number)=>{const progress=Math.min(1,(now-start)/duration);setCount(Math.round(number*(1-(1-progress)**3)));if(progress<1)frame=window.requestAnimationFrame(tick)};frame=window.requestAnimationFrame(tick);return()=>window.cancelAnimationFrame(frame)},[number,reduced,visible]);
 return <div ref={ref}><p className="marketing-stat-value">{number===null?'—':count.toLocaleString()}</p><p className="mt-3 text-sm font-semibold text-slate-700">{label}</p>{number===null&&<p className="mt-1 text-xs text-slate-500">Verified figure not published</p>}</div>
}
export default function CredibilityStats(){return <section aria-label="Aerotech company statistics" className="marketing-stats">{metrics.map(m=><Metric key={m.label} value={m.value} label={m.label}/>)}</section>}
