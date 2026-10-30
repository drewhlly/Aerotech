'use client';
import {useEffect,type ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import {useExpiryClock} from './use-event-refresh';
import {eventVisible} from '@/lib/event-display';
export default function ExpiringContent({expiresAt,children}:{expiresAt:string|null;children:ReactNode}){
 const now=useExpiryClock([expiresAt]),router=useRouter(),visible=eventVisible(expiresAt,now);
 useEffect(()=>{if(!visible)queueMicrotask(()=>router.refresh())},[visible,router]);
 return visible?children:null;
}
