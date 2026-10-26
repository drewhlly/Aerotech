import {workspaceMetadata} from '@/lib/route-metadata';
export const generateMetadata=workspaceMetadata;
import WorkspaceShell from '@/components/workspace-shell';
import {currentApplicant} from '@/lib/applicant-session';
import {currentEmployee} from '@/lib/employee-auth';import {currentEmployer} from '@/lib/employer-session';import {redirect} from 'next/navigation';
export default async function Layout({children}:{children:React.ReactNode}){const employee=await currentEmployee();if(employee)return <WorkspaceShell role="employee">{children}</WorkspaceShell>;if(await currentEmployer())return <WorkspaceShell role="employer">{children}</WorkspaceShell>;if(await currentApplicant())return <WorkspaceShell role="applicant">{children}</WorkspaceShell>;redirect('/auth/login?role=applicant')}
