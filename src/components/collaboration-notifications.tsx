"use client";
import {useContext,useEffect,useRef,useState} from "react";
import {WorkspaceRoleContext} from "./workspace-shell";
import NotificationInbox from "./notification-inbox";
import {api} from "./collaboration-client";
import {useFeedback} from "./use-feedback";
type Pref={event:string;in_app:boolean;email:boolean;digest:string};
const events=["assignment","mention","due","overdue","status","comment","meeting","document"];
export default function CollaborationNotifications(){
 const role=useContext(WorkspaceRoleContext)==="employer"?"employer":"employee",[prefs,setPrefs]=useState<Pref[]>([]),[message,setMessage]=useFeedback(),editor=useRef<HTMLDetailsElement>(null);
 useEffect(()=>{void api<{preferences:Pref[]}>("/api/collaboration/notifications?limit=1").then(d=>setPrefs(d.preferences)).catch(e=>setMessage(e.message))},[setMessage]);
 async function save(p:Pref){try{await api("/api/collaboration/notifications","PATCH",{event:p.event,inApp:p.in_app,email:p.email,digest:p.digest});setPrefs(v=>[...v.filter(x=>x.event!==p.event),p]);setMessage("Preference saved.");if(editor.current)editor.current.open=false}catch(e){setMessage((e as Error).message)}}
 return <section className="aero-card mt-6 space-y-5"><NotificationInbox role={role} collaboration/>{message&&<p role="status">{message}</p>}<details ref={editor}><summary className="cursor-pointer font-semibold">Notification preferences</summary><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{["Event","In app","Email","Digest"].map(t=><th className="p-2" key={t}>{t}</th>)}</tr></thead><tbody>{events.map(event=>{const p=prefs.find(p=>p.event===event)||{event,in_app:true,email:true,digest:"none"};return <tr key={event}><th className="p-2 capitalize">{event}</th><td><input type="checkbox" aria-label={event+" in app"} checked={p.in_app} onChange={e=>void save({...p,in_app:e.target.checked})}/></td><td><input type="checkbox" aria-label={event+" email"} checked={p.email} onChange={e=>void save({...p,email:e.target.checked})}/></td><td><select className="aero-input" aria-label={event+" digest"} value={p.digest} onChange={e=>void save({...p,digest:e.target.value})}>{["none","daily","weekly"].map(s=><option key={s}>{s}</option>)}</select></td></tr>})}</tbody></table></div></details></section>
}
