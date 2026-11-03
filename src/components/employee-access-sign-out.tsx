"use client";
import {useRouter} from 'next/navigation';
import {useState} from 'react';
export default function EmployeeAccessSignOut(){
 const router=useRouter();
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function signOut(){setBusy(true);try{const response=await fetch('/api/auth/logout/employee',{method:'POST'});if(!response.ok)throw Error();router.replace('/auth/login?role=employee');router.refresh()}catch{setError('Unable to sign out. Please retry.');setBusy(false)}}
 return <div className="mt-5"><button type="button" onClick={()=>void signOut()} disabled={busy} className="aero-button border">{busy?'Signing out…':'Sign out'}</button>{error&&<p role="alert" className="mt-3 text-red-700">{error}</p>}</div>;
}
