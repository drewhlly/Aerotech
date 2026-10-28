"use client";
import {useEffect,useRef,useState,type RefObject} from "react";
export function useIdleDismiss(ref:RefObject<HTMLElement|null>,close:()=>void,active=true){
 const callback=useRef(close),[keepOpen,setKeepOpen]=useState(false);
 useEffect(()=>{callback.current=close},[close]);
 useEffect(()=>{const root=ref.current;if(!active||!root||keepOpen)return;let edited=false,timer:ReturnType<typeof setTimeout>;
 const schedule=()=>{clearTimeout(timer);if(!edited)timer=setTimeout(()=>callback.current(),60000)};
 const change=()=>{edited=true;clearTimeout(timer)};
 for(const e of ['input','change'])root.addEventListener(e,change);
 for(const e of ['pointerdown','keydown'])root.addEventListener(e,schedule);schedule();
 return()=>{clearTimeout(timer);for(const e of ['input','change'])root.removeEventListener(e,change);for(const e of ['pointerdown','keydown'])root.removeEventListener(e,schedule)}},[ref,active,keepOpen]);
 return {keepOpen,setKeepOpen};
}
