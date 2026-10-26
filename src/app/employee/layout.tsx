import {headers} from 'next/headers';
import {loginUrl} from '@/lib/auth-navigation';
import WorkspaceShell from "@/components/workspace-shell";
import {redirect} from "next/navigation";
import {currentEmployee} from "@/lib/employee-auth";
export default async function EmployeeLayout({children}:{children:React.ReactNode}){
 const employee=await currentEmployee();if(!employee)redirect(loginUrl('employee',(await headers()).get('x-aerotech-return-path')||undefined));
 return <WorkspaceShell role="employee">{children}</WorkspaceShell>;
}
