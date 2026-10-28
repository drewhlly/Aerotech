'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
// Tab-scoped drafts are isolated by the authenticated account and expire after seven days.
export function useFormDraft<T>({accountKey,extra,restoreExtra}:{accountKey:string;extra:T;restoreExtra:(extra:T)=>void}){
 const ref=useRef<HTMLFormElement>(null),extraRef=useRef(extra),restoreRef=useRef(restoreExtra),ready=useRef(false),active=useRef(true),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const [notice,setNotice]=useState('');
 useEffect(()=>{extraRef.current=extra;restoreRef.current=restoreExtra},[extra,restoreExtra]);
 const key='aerotech-form-v1:'+accountKey;
 const save=useCallback(()=>{if(!ready.current||!active.current||!ref.current)return;try{const fields:Record<string,string|boolean>={};for(const element of Array.from(ref.current.elements)){if((element instanceof HTMLInputElement||element instanceof HTMLSelectElement||element instanceof HTMLTextAreaElement)&&element.name&&element.type!=='password'&&element.type!=='file')fields[element.name]=element instanceof HTMLInputElement&&element.type==='checkbox'?element.checked:element.value}sessionStorage.setItem(key,JSON.stringify({version:1,at:Date.now(),fields,extra:extraRef.current}));setNotice('Draft saved in this browser tab.')}catch{setNotice('Draft recovery is unavailable. Keep this tab open until you save.')}},[key]);
 const schedule=useCallback(()=>{clearTimeout(timer.current);timer.current=setTimeout(save,500)},[save]);
 useEffect(()=>{active.current=true;try{const draft=JSON.parse(sessionStorage.getItem(key)||'null');if(draft?.version===1&&Date.now()-draft.at<7*86400000&&draft.fields&&typeof draft.fields==='object'){for(const element of Array.from(ref.current?.elements||[])){if((element instanceof HTMLInputElement||element instanceof HTMLSelectElement||element instanceof HTMLTextAreaElement)&&element.name in draft.fields){const value=draft.fields[element.name];if(element instanceof HTMLInputElement&&element.type==='checkbox')element.checked=value===true;else if(typeof value==='string')element.value=value}}queueMicrotask(()=>{restoreRef.current(draft.extra);setNotice('Recovered your draft from this browser tab.')})}}catch{}ready.current=true;return()=>{clearTimeout(timer.current);save();ready.current=false}},[key,save]);
 useEffect(()=>{schedule();return()=>clearTimeout(timer.current)},[extra,schedule]);
 const clear=useCallback(()=>{active.current=false;clearTimeout(timer.current);try{sessionStorage.removeItem(key)}catch{}setNotice('')},[key]);
 return {formRef:ref,onChange:schedule,clear,notice};
}
