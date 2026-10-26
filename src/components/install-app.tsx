"use client";
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
type InstallEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed'}>};
const InstallContext=createContext<{event:InstallEvent|null;installed:boolean;offlineError:boolean}>({event:null,installed:false,offlineError:false});
export function InstallProvider({children}:{children:ReactNode}){
 const [event,setEvent]=useState<InstallEvent|null>(null),[installed,setInstalled]=useState(false),[offlineError,setOfflineError]=useState(false);
 useEffect(()=>{
  const capture=(e:Event)=>{e.preventDefault();setEvent(e as InstallEvent)},complete=()=>{setInstalled(true);setEvent(null)};
  window.addEventListener('beforeinstallprompt',capture);window.addEventListener('appinstalled',complete);
  const display=window.matchMedia('(display-mode: standalone)');
  void Promise.resolve().then(()=>setInstalled(display.matches||Boolean((navigator as Navigator&{standalone?:boolean}).standalone)));
  if(process.env.NODE_ENV==='production'&&'serviceWorker' in navigator){void navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'}).catch(()=>setOfflineError(true))}
  return()=>{window.removeEventListener('beforeinstallprompt',capture);window.removeEventListener('appinstalled',complete)};
 },[]);
 return <InstallContext.Provider value={{event,installed,offlineError}}>{children}</InstallContext.Provider>;
}
export default function InstallApp(){
 const {event,installed,offlineError}=useContext(InstallContext),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[used,setUsed]=useState<InstallEvent|null>(null);
 async function install(){if(!event||busy||used===event)return;setBusy(true);setMessage('');try{await event.prompt();const choice=await event.userChoice;setUsed(event);setMessage(choice.outcome==='accepted'?'Installation requested. Follow your browser’s confirmation.':'Installation cancelled. You can use your browser menu to install later.')}catch{setUsed(event);setMessage('The install prompt is unavailable. Follow the browser instructions below.')}finally{setBusy(false)}}
 return <section className="aero-card space-y-4" aria-label="Install Aerotech">
 {installed?<p role="status">Aerotech is already open in app mode on this device.</p>:event&&used!==event?<button className="aero-button bg-blue-700 text-white" disabled={busy} onClick={()=>void install()}>{busy?'Opening install prompt…':'Install Aerotech'}</button>:<p>Use your browser’s menu to install Aerotech. The install option depends on your browser and device.</p>}
 {message&&<p role="status">{message}</p>}{offlineError&&<p role="alert">Offline connection guidance could not be enabled in this browser. You can still use Aerotech online.</p>}
 <h2 className="text-xl font-bold">iPhone or iPad</h2><p>Open this website in Safari, tap Share, then Add to Home Screen. If shown, enable Open as Web App, then tap Add.</p>
 <h2 className="text-xl font-bold">Android</h2><p>Open Aerotech in Chrome, tap the browser menu, then Install app or Add to Home screen. Confirm the installation.</p>
 <h2 className="text-xl font-bold">Computer</h2><p>In Chrome or Edge, use the install icon in the address bar or the browser’s app-install menu when available.</p>
 </section>;
}
