'use client';
import CollaborationSearch from './collaboration-search';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {Moon,Sun,PanelLeftClose,PanelLeftOpen,HelpCircle} from 'lucide-react';
import {employerLinks} from './employer-nav';
import {employeeLinks} from './employee-nav';
import {applicantLinks} from './applicant-nav';
import {adminLinks} from './admin-nav';
import {workspaceHomes,type WorkspaceRole} from '@/lib/portal-policy';
export default function WorkspaceTools({role,onCollapse,collapsed=false}:{role:WorkspaceRole;onCollapse:()=>void;collapsed?:boolean}){
 const [dark,setDark]=useState(false);
 const links=role==='employer'?employerLinks:role==='employee'?employeeLinks:role==='applicant'?applicantLinks:adminLinks;
 useEffect(()=>{try{const value=localStorage.getItem('aerotech-theme')==='dark';queueMicrotask(()=>{setDark(value);document.documentElement.dataset.theme=value?'dark':'light'})}catch{}return()=>{delete document.documentElement.dataset.theme}},[]);
 function theme(){const next=!dark;setDark(next);document.documentElement.dataset.theme=next?'dark':'light';try{localStorage.setItem('aerotech-theme',next?'dark':'light')}catch{}}
 return <><button type="button" onClick={onCollapse} aria-label={collapsed?'Expand sidebar':'Collapse sidebar'} aria-expanded={!collapsed} title={collapsed?'Expand sidebar':'Collapse sidebar'} className="workspace-icon-button workspace-sidebar-toggle">{collapsed?<PanelLeftOpen size={19}/>:<PanelLeftClose size={19}/>}</button><CollaborationSearch role={role} navigation={links.map(([href,label])=>({href,label}))}/><span className="workspace-toolbar-divider" aria-hidden="true"/><button type="button" onClick={theme} aria-label={dark?'Use light mode':'Use dark mode'} title={dark?'Use light mode':'Use dark mode'} className="workspace-icon-button">{dark?<Sun size={19}/>:<Moon size={19}/>}</button><Link href={workspaceHomes[role]+'/support'} aria-label="Help and support" title="Help and support" className="workspace-icon-button workspace-help"><HelpCircle size={19} aria-hidden="true"/><span>Help</span></Link></>;
}
