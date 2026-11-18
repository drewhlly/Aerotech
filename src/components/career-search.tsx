'use client';
import {useState} from 'react';
import Link from 'next/link';
import {Search,SlidersHorizontal} from 'lucide-react';
import {Chip,Input} from '@/components/marketing-ui';
export default function CareerSearch(){
 const [advanced,setAdvanced]=useState(false);
 return <div className="marketing-container marketing-search-card" aria-label="Find jobs with Aerotech">
  <p className="marketing-eyebrow">Explore opportunities</p>
  <form action="/careers" method="get" data-read-only-search="true" className="mt-4">
   <div className="marketing-search-grid">
    <Input name="q" label="I'm looking for" placeholder="Job title, skills or keywords"/>
    <Input name="location" label="Somewhere near" placeholder="City, region or country"/>
    <button type="submit" className="marketing-button marketing-button--secondary"><Search size={18} aria-hidden="true"/>Search jobs</button>
   </div>
   <button type="button" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blue-800" aria-expanded={advanced} aria-controls="advanced-career-search" onClick={()=>setAdvanced(v=>!v)}><SlidersHorizontal size={16} aria-hidden/>Advanced search</button>
   {advanced&&<div id="advanced-career-search" className="mt-3 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-3"><label className="text-sm font-semibold">Work type<select className="marketing-input" name="type"><option value="">All types</option><option>Full-time</option><option>Part-time</option><option>Contract</option></select></label><label className="text-sm font-semibold">Minimum salary<input className="marketing-input" type="number" min={0} name="salary" placeholder="Optional"/></label><label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold"><input type="checkbox" name="remote" value="true"/>Remote opportunities only</label></div>}
  </form>
  <div className="mt-5 flex flex-wrap items-center gap-2"><span className="mr-2 text-xs font-semibold uppercase tracking-wider text-slate-600">Popular searches</span>{['Engineering','Operations','Finance','Human resources'].map(q=><Chip key={q} href={'/careers?q='+encodeURIComponent(q)}>{q}</Chip>)}<Link href="/careers" className="ml-auto inline-flex min-h-10 items-center text-sm font-semibold text-blue-800">Browse all jobs</Link></div>
 </div>
}
