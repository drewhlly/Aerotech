"use client";
import {useEffect,useRef,useState} from "react";
import {useContext} from 'react';
import {WorkspaceRoleContext} from '@/components/workspace-shell';
import {workspaceHomes} from '@/lib/portal-policy';
import Link from "next/link";
type Conference={dispose:()=>void};
type JitsiWindow=Window & {JitsiMeetExternalAPI?:new(domain:string,options:Record<string,unknown>)=>Conference};
export default function JoinMeeting({params}:{params:Promise<{id:string}>}){
 const role=useContext(WorkspaceRoleContext)||'employee',meetBase=workspaceHomes[role]+'/meet';
 const [message,setMessage]=useState("Connecting to meeting...");
 const container=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  let cancelled=false;let instance:Conference|undefined;let script:HTMLScriptElement|undefined;
  async function connect(){
   try{
    const {id}=await params;
    const response=await fetch("/api/meet/"+encodeURIComponent(id)+"/join",{cache:"no-store"});
    const result=await response.json();
    if(!response.ok)throw Error(result.error||"Unable to join");
    if(cancelled)return;
    const domain=String(result.domain);
    script=document.createElement("script");script.src="https://"+domain+"/"+(domain==="8x8.vc"?String(result.room).split("/")[0]+"/":"")+"external_api.js";script.async=true;
    script.onload=()=>{
     if(cancelled||!container.current)return;
     const Jitsi=(window as JitsiWindow).JitsiMeetExternalAPI;
     if(!Jitsi){setMessage("Meeting service did not load.");return;}
     instance=new Jitsi(domain,{roomName:result.room,jwt:result.token,width:"100%",height:"100%",parentNode:container.current,configOverwrite:{startWithAudioMuted:true,startWithVideoMuted:true,subject:"Aerotech meeting",hideConferenceSubject:true}});
     setMessage("");
    };
    script.onerror=()=>setMessage("Could not reach the configured meeting server.");
    document.body.appendChild(script);
   }catch(e){if(!cancelled)setMessage(e instanceof Error?e.message:"Unable to join meeting");}
  }
  void connect();return ()=>{cancelled=true;instance?.dispose();script?.remove();};
 },[params]);
 return <div className="space-y-4"><section className="aero-card flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900">Meeting room</h1><p className="mt-2 text-sm text-slate-500">Use the call controls to turn on your microphone or camera.</p></div><Link href={meetBase} className="aero-button bg-blue-50 text-blue-700">All meetings</Link></section>{message&&<p role="status" className="text-sm text-slate-600">{message}</p>}<div ref={container} className="meeting-stage overflow-hidden rounded-2xl bg-slate-950"/></div>;
}
