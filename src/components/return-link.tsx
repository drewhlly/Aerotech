'use client';
import Link from 'next/link';
import {useContext} from 'react';
import {usePathname} from 'next/navigation';
import {WorkspaceRoleContext} from './workspace-shell';
import {routeRole,workspaceHomes} from '@/lib/portal-policy';
export default function ReturnLink(){const context=useContext(WorkspaceRoleContext),path=usePathname(),role=context||routeRole(path);return <Link className="aero-button bg-blue-700 text-white" href={role?workspaceHomes[role]:path.startsWith('/support-console')?'/support-console':'/'}>{role?'Return to my dashboard':'Back to home'}</Link>}
