"use client";
import {useEffect,useState} from "react";
import {isCompletedFeedback} from "@/lib/feedback-policy";
export function useFeedback(initial=""){
 const [message,setMessage]=useState(initial);
 useEffect(()=>{if(!isCompletedFeedback(message))return;const t=setTimeout(()=>setMessage(""),7000);return()=>clearTimeout(t)},[message]);
 return [message,setMessage] as const;
}
