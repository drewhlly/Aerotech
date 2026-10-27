"use client";
import {useRouter,usePathname} from 'next/navigation';import {useContext} from 'react';import Link from 'next/link';
import {WorkspaceRoleContext} from './workspace-shell';import {workspaceLink,workspaceHomes,routeRole} from '@/lib/portal-policy';
export default function BackNavigation({fallback='/'}:{fallback?:string}){const router=useRouter(),path=usePathname(),context=useContext(WorkspaceRoleContext),role=context||routeRole(path),target=role?(fallback==='/'?workspaceHomes[role]:workspaceLink(role,fallback)):fallback;return <div className="mb-5 flex items-center gap-4 text-sm"><button className="aero-button border bg-white" onClick={()=>router.push(target)}>← Back</button><Link className="aero-button text-blue-700" href={target}>Overview</Link></div>}
