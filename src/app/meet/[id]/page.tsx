"use client";
import {useEffect,useRef,useState} from "react";
import Link from "next/link";
type Conference={dispose:()=>void};
type JitsiWindow=Window & {JitsiMeetExternalAPI?:new(domain:string,options:Record<string,unknown>)=>Conference};
export default function JoinMeeting({params}:{params:Promise<{id:string}>}){
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
    script=document.createElement("script");script.src="https://"+domain+"/external_api.js";script.async=true;
    script.onload=()=>{
     if(cancelled||!container.current)return;
     const Jitsi=(window as JitsiWindow).JitsiMeetExternalAPI;
     if(!Jitsi){setMessage("Meeting service did not load.");return;}
     instance=new Jitsi(domain,{roomName:result.room,jwt:result.token,width:"100%",height:650,parentNode:container.current,configOverwrite:{startWithAudioMuted:true,startWithVideoMuted:true}});
     setMessage("");
    };
    script.onerror=()=>setMessage("Could not reach the configured meeting server.");
    document.body.appendChild(script);
   }catch(e){if(!cancelled)setMessage(e instanceof Error?e.message:"Unable to join meeting");}
  }
  void connect();return ()=>{cancelled=true;instance?.dispose();script?.remove();};
 },[params]);
 return <main className="min-h-screen bg-slate-950 p-4 text-white"><div className="mx-auto max-w-6xl"><Link href="/meet" className="text-sm underline">Back to Aerotech Meet</Link><h1 className="mt-4 text-2xl font-bold">Meeting room</h1><p role="status" className="my-4 text-sm">{message}</p><div ref={container} className="mt-3 min-h-[420px] overflow-hidden rounded-xl bg-slate-900"/></div></main>;
}
