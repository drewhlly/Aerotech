'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {Search,X,ChevronRight,Compass,FileSearch} from 'lucide-react';
import CollaborationDialog from './collaboration-dialog';
import WorkspaceSearchTrigger from './workspace-search-trigger';
import {api} from './collaboration-client';
import {linkAllowed,type WorkspaceRole} from '@/lib/portal-policy';
type RecordResult={id:string;title:string;kind:string;href:string};
export default function CollaborationSearch({role,navigation=[]}:{role:WorkspaceRole;navigation?:{href:string;label:string}[]}){
 const [open,setOpen]=useState(false),[q,setQ]=useState(''),[records,setRecords]=useState<RecordResult[]>([]),[message,setMessage]=useState(''),[loading,setLoading]=useState(false),[retry,setRetry]=useState(0);
 const input=useRef<HTMLInputElement>(null);
 useEffect(()=>{if(!open)return;const frame=requestAnimationFrame(()=>input.current?.focus());return()=>cancelAnimationFrame(frame)},[open]);
 const dataSearch=role==='employer'||role==='employee',term=q.trim();
 useEffect(()=>{
  const keydown=(e:KeyboardEvent)=>{if(!e.repeat&&(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setMessage('');setRecords([]);setLoading(dataSearch&&term.length>=2);setOpen(v=>!v)}};
  window.addEventListener('keydown',keydown);return()=>window.removeEventListener('keydown',keydown);
 },[dataSearch,term]);
 useEffect(()=>{
  if(!open||!dataSearch||term.length<2)return;
  const controller=new AbortController();
  const timer=setTimeout(()=>void api<{records:RecordResult[]}>('/api/collaboration/search?q='+encodeURIComponent(term),'GET',undefined,controller.signal).then(d=>{if(controller.signal.aborted)return;setRecords(d.records.filter(r=>linkAllowed(role,r.href)));setLoading(false);setMessage('')}).catch(e=>{if(e.name!=='AbortError'&&!controller.signal.aborted){setMessage('Search is temporarily unavailable. Your workspace shortcuts are still available.');setLoading(false)}}),250);
  return()=>{clearTimeout(timer);controller.abort()};
 },[open,term,role,dataSearch,retry]);
 function change(value:string){setQ(value);setRecords([]);setMessage('');setLoading(dataSearch&&value.trim().length>=2)}
 const shortcuts=navigation.filter(n=>n.label.toLowerCase().includes(term.toLowerCase())&&linkAllowed(role,n.href));
 return <><WorkspaceSearchTrigger onClick={()=>{setRecords([]);setMessage('');setLoading(dataSearch&&term.length>=2);setOpen(true)}}/>{open&&<CollaborationDialog title="Search your workspace" close={()=>setOpen(false)}><div className="workspace-command-search"><Search size={21} aria-hidden="true"/><label className="sr-only" htmlFor="workspace-command-input">Search</label><input ref={input} id="workspace-command-input" autoFocus type="search" autoComplete="off" value={q} onChange={e=>change(e.target.value)} placeholder={dataSearch?'Search pages, people, tasks and documents…':'Search pages in your workspace…'}/>{q&&<button type="button" className="workspace-icon-button" aria-label="Clear search" onClick={()=>{change('');input.current?.focus()}}><X size={17}/></button>}</div><div className="workspace-search-results">{shortcuts.length>0&&<section aria-label="Workspace shortcuts"><h3 className="workspace-search-section-title"><Compass size={15} aria-hidden="true"/>{term?'Matching pages':'Workspace shortcuts'}</h3><ul>{shortcuts.map(n=><li key={n.href}><Link className="workspace-search-result" href={n.href} onClick={()=>setOpen(false)}><span>{n.label}</span><ChevronRight size={16} aria-hidden="true"/></Link></li>)}</ul></section>}{loading&&<p role="status" className="px-3 py-4 text-sm text-slate-600">Searching your workspace…</p>}{message&&<div role="alert" className="rounded-xl border border-slate-200 p-4 text-sm"><p>{message}</p><button className="aero-button mt-3 border" onClick={()=>{setMessage('');setLoading(true);setRetry(v=>v+1)}}>Retry search</button></div>}{records.length>0&&<section aria-label="Search results"><h3 className="workspace-search-section-title"><FileSearch size={15} aria-hidden="true"/>Records</h3><ul>{records.map(r=><li key={r.kind+r.id}><Link className="workspace-search-result" href={r.href} onClick={()=>setOpen(false)}><span className="min-w-0"><span className="block truncate font-medium">{r.title}</span><span className="mt-1 block text-xs capitalize text-slate-600">{r.kind}</span></span><ChevronRight size={16} aria-hidden="true"/></Link></li>)}</ul></section>}{!loading&&!message&&!shortcuts.length&&!records.length&&<div className="py-8 text-center"><Search className="mx-auto mb-3 text-slate-500" size={26} aria-hidden="true"/><p className="font-semibold">No matching results</p><p className="mt-2 text-sm text-slate-600">Try another name or keyword.</p></div>}{dataSearch&&term.length<2&&<p className="px-3 py-3 text-sm text-slate-600">Type at least two characters to search records you can access.</p>}</div><p className="mt-4 border-t border-slate-200 pt-4 text-xs text-slate-600">Tab to browse · Enter to open a link · Esc to close</p></CollaborationDialog>}</>;
}
