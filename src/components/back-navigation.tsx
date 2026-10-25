"use client";
import {useRouter} from 'next/navigation';import Link from 'next/link';
export default function BackNavigation({fallback='/'}:{fallback?:string}){const router=useRouter();return <div className="mb-5 flex items-center gap-4 text-sm"><button className="rounded-lg border border-slate-200 bg-white px-3 py-2" onClick={()=>window.history.length>1?router.back():router.push(fallback)}>← Back</button><Link className="text-blue-700" href={fallback}>Overview</Link></div>}
