'use client';
import {useEffect,useState} from 'react';
import {Search} from 'lucide-react';
export default function WorkspaceSearchTrigger({onClick}:{onClick:()=>void}){
 const [modifier,setModifier]=useState('Ctrl');
 useEffect(()=>{queueMicrotask(()=>setModifier(/Mac|iPhone|iPad/.test(navigator.platform)?'⌘':'Ctrl'))},[]);
 return <button type="button" onClick={onClick} className="workspace-search-trigger" aria-label="Search workspace, Control or Command K" aria-haspopup="dialog" aria-keyshortcuts="Control+k Meta+k" title="Search workspace (Ctrl / ⌘ K)"><Search size={19} aria-hidden="true"/><span className="workspace-search-label">Search workspace…</span><kbd aria-hidden="true" className="workspace-search-shortcut"><span>{modifier}</span><span>K</span></kbd></button>;
}
