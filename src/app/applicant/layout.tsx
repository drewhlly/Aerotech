import {headers} from 'next/headers';
import {loginUrl} from '@/lib/auth-navigation';
import {redirect} from 'next/navigation';
import {currentApplicant} from '@/lib/applicant-session';
import WorkspaceShell from '@/components/workspace-shell';
export default async function Layout({children}:{children:React.ReactNode}){if(!await currentApplicant())redirect(loginUrl('applicant',(await headers()).get('x-aerotech-return-path')||undefined));return <WorkspaceShell role="applicant">{children}</WorkspaceShell>}
