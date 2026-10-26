import WorkspaceShell from '@/components/workspace-shell';
import {currentEmployee} from '@/lib/employee-auth';
import {currentEmployer} from '@/lib/employer-session';
import {redirect} from 'next/navigation';
export {generateMetadata} from '../meet/layout';
export default async function Layout({children}:{children:React.ReactNode}){if(await currentEmployee())return <WorkspaceShell role="employee">{children}</WorkspaceShell>;if(await currentEmployer())return <WorkspaceShell role="employer">{children}</WorkspaceShell>;if(await currentEmployer(false))redirect('/billing');redirect('/auth/login?role=employee&next=%2Faerochat')}
