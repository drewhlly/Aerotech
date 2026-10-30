"use client";
import {useCallback,useEffect,useRef,useState} from "react";

type AttendanceEvent={id:string;event_type:"clock_in"|"clock_out";event_time:string;work_date:string;source?:string};
type AttendanceResponse={events:AttendanceEvent[];today:string;faceEnabled:boolean;enrolled:boolean;sites:{id:string;name:string}[];assignedSiteId:string|null};

export default function AttendancePage(){
 const [data,setData]=useState<AttendanceResponse|null>(null);
 const [siteId,setSiteId]=useState("");
 const [busy,setBusy]=useState<"clock_in"|"clock_out"|null>(null);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [consent,setConsent]=useState(false);
 const [cameraOpen,setCameraOpen]=useState(false);
 const video=useRef<HTMLVideoElement>(null);
 const stream=useRef<MediaStream|null>(null);
 const stopCamera=useCallback(()=>{stream.current?.getTracks().forEach(track=>track.stop());stream.current=null;setCameraOpen(false);},[]);
 const reload=useCallback(async()=>{const response=await fetch("/api/employee/attendance",{cache:"no-store"});const body=await response.json();if(!response.ok)throw new Error(body.error||"Attendance could not be loaded");const next=body as AttendanceResponse;setData(next);setSiteId(next.assignedSiteId||"");},[]);
 useEffect(()=>{void Promise.resolve().then(reload).catch(e=>setError(e instanceof Error?e.message:"Attendance unavailable"));return()=>{stream.current?.getTracks().forEach(track=>track.stop());};},[reload]);
 const todayEvents=data?.events.filter(event=>String(event.work_date).slice(0,10)===data.today)||[];
 const clockedIn=todayEvents.some(event=>event.event_type==="clock_in");
 const clockedOut=todayEvents.some(event=>event.event_type==="clock_out");
 const faceRequired=Boolean(data?.faceEnabled&&data?.enrolled);
 async function startCamera(){
  setError("");setNotice("");
  try{
   if(!navigator.mediaDevices?.getUserMedia)throw new Error("Camera is unavailable. Use a recent browser on HTTPS, or contact HR for an alternative attendance arrangement.");
   const next=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:640},height:{ideal:480}},audio:false});
   stream.current=next;setCameraOpen(true);
   if(video.current){video.current.srcObject=next;await video.current.play();}
  }catch(e){stopCamera();setError(e instanceof Error?e.message:"Camera permission was denied");}
 }
 async function clock(eventType:"clock_in"|"clock_out"){
  if(busy)return;
  setBusy(eventType);setError("");setNotice("");
  try{
   if(!navigator.geolocation)throw new Error("This device does not support browser location. Contact HR for an alternative check-in.");
   const position=await new Promise<GeolocationPosition>((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,timeout:20000,maximumAge:0}));
   let image: string|undefined;
   if(faceRequired){
    if(!consent)throw new Error("Face verification consent is required for this verification method. Contact HR for an alternative.");
    const element=video.current;
    if(!cameraOpen||!element?.videoWidth)throw new Error("Open your camera and wait for the live preview before recording attendance.");
    const canvas=document.createElement("canvas");canvas.width=480;canvas.height=Math.round(element.videoHeight/element.videoWidth*480);
    canvas.getContext("2d")?.drawImage(element,0,0,canvas.width,canvas.height);
    image=canvas.toDataURL("image/jpeg",0.8);
   }
   const response=await fetch("/api/employee/attendance",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({eventType,siteId:siteId||undefined,latitude:position.coords.latitude,longitude:position.coords.longitude,accuracy:position.coords.accuracy,consent:faceRequired?consent:undefined,image})});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||"Attendance could not be saved");
   stopCamera();await reload();setNotice(result.message||"Attendance recorded successfully.");
  }catch(e){
   const message=e instanceof Error?e.message:"Attendance could not be recorded";
   setError(/permission denied|user denied geolocation/i.test(message)?"Location permission is off. Allow location access for this site in your browser settings and try again.":message);
  }finally{setBusy(null);}
 }
 return <div className="space-y-6">
  <header className="aero-hero"><p className="text-xs font-semibold uppercase tracking-widest text-cyan-200">Employee workspace</p><h1 className="mt-2 text-3xl font-bold">My attendance</h1><p className="mt-2 text-sm text-slate-300">Clock in and out securely from a phone, tablet or computer. Your attendance is saved to your employer’s records.</p></header>
  <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
   <section className="aero-card space-y-5" aria-labelledby="today-heading">
    <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Today · {data?.today||"Loading"} · Lagos time</p><h2 id="today-heading" className="mt-2 text-2xl font-bold text-slate-900">{clockedOut?"Workday completed":clockedIn?"You are clocked in":"Ready for your shift"}</h2><p className="mt-2 text-sm text-slate-600">{clockedOut?"Your clock-in and clock-out are recorded.":clockedIn?"Remember to clock out when your shift ends.":"Allow your browser to access your device location when prompted."}</p></div>
    {!data?.assignedSiteId&&<div className="rounded-xl border border-blue-200 bg-blue-50 p-4"><label htmlFor="attendance-site" className="text-sm font-semibold text-slate-900">Workplace / outlet</label><select id="attendance-site" className="aero-input mt-2 w-full" value={siteId} onChange={e=>setSiteId(e.target.value)}><option value="">No assignment — submit for HR review</option>{data?.sites.map(site=><option key={site.id} value={site.id}>{site.name}</option>)}</select><p className="mt-2 text-xs text-slate-600">{siteId?"Your device location will be checked against this workplace.":"Your attendance can be recorded as pending review until HR assigns a workplace; it will not be marked location-verified."}</p></div>}
    {faceRequired&&<div className="space-y-3 rounded-xl border border-slate-200 p-4"><h3 className="font-semibold text-slate-900">Face verification</h3><p className="text-sm text-slate-600">Your company has enabled face matching for your enrolled account. Open the camera before clocking in or out.</p><video ref={video} autoPlay playsInline muted className={cameraOpen?"aspect-video w-full rounded-xl bg-slate-950 object-cover":"hidden"} style={{transform:"scaleX(-1)"}}/><label className="flex items-start gap-2 text-xs text-slate-600"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>I consent to face matching for this attendance action.</label><button className="aero-button border border-slate-300" disabled={!!busy} onClick={cameraOpen?stopCamera:startCamera}>{cameraOpen?"Close camera":"Open camera"}</button><p className="text-xs text-slate-500">If verification is inaccessible or you do not consent, ask HR for an alternative attendance method.</p></div>}
    {data?.faceEnabled&&!data.enrolled&&<p className="text-sm text-slate-600">Face verification is not enrolled for this account. Location-based attendance remains available.</p>}
    <div className="grid gap-3 sm:grid-cols-2"><button className="aero-button bg-blue-600 text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={!data||!!busy||clockedIn||clockedOut} onClick={()=>void clock("clock_in")}>{busy==="clock_in"?"Recording clock-in…":"Clock in"}</button><button className="aero-button border border-slate-300 disabled:cursor-not-allowed disabled:opacity-50" disabled={!data||!!busy||!clockedIn||clockedOut} onClick={()=>void clock("clock_out")}>{busy==="clock_out"?"Recording clock-out…":"Clock out"}</button></div>
    {notice&&<p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}{error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <p className="text-xs leading-5 text-slate-500">Requires HTTPS, an active internet connection, browser location permission and a GPS-capable device. When these are unavailable, request HR assistance. Device support does not guarantee that location permissions or GPS will work on every device.</p>
   </section>
   <section className="aero-card" aria-labelledby="history-heading"><div className="flex items-center justify-between gap-3"><h2 id="history-heading" className="text-xl font-bold">Recent activity</h2><button className="text-sm font-semibold text-blue-700 hover:underline" onClick={()=>void reload().catch(e=>setError(e.message))}>Refresh</button></div><div className="mt-4 divide-y divide-slate-100">{data?.events.map(event=><div key={event.id} className="flex items-center justify-between gap-3 py-4 text-sm"><span className="font-medium capitalize text-slate-800">{event.event_type.replace("_"," ")}</span><time dateTime={event.event_time} className="text-right text-slate-500">{new Date(event.event_time).toLocaleString("en-NG",{dateStyle:"medium",timeStyle:"short",timeZone:"Africa/Lagos"})}</time></div>)}{data&&!data.events.length&&<p className="py-5 text-sm text-slate-500">No attendance activity recorded yet.</p>}{!data&&!error&&<p className="py-5 text-sm text-slate-500">Loading attendance records…</p>}</div></section>
  </div>
 </div>;
}
