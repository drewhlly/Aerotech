import {workspaceMetadata} from '@/lib/route-metadata';
import {currentEmployer} from '@/lib/employer-session';
import {redirect} from 'next/navigation';
import {headers} from 'next/headers';
import {loginUrl} from '@/lib/auth-navigation';
export const generateMetadata=workspaceMetadata;
export default async function Layout({children}:{children:React.ReactNode}){if(!await currentEmployer(false))redirect(loginUrl('employer',(await headers()).get('x-aerotech-return-path')||'/billing'));return children}
