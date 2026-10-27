import {workspaceMetadata} from '@/lib/route-metadata';
export const generateMetadata=workspaceMetadata;
import {headers} from 'next/headers';
import {loginUrl} from '@/lib/auth-navigation';
import {PortalFrame} from "@/components/workspace-shell";
import EmployeeNav from "@/components/employee-nav";
import SupportLayout from "@/components/support-layout";
import {redirect} from "next/navigation";
import {currentEmployee} from "@/lib/employee-auth";
export default async function EmployeeLayout({children}:{children:React.ReactNode}){
 const employee=await currentEmployee();if(!employee)redirect(loginUrl('employee',(await headers()).get('x-aerotech-return-path')||undefined));
 if((await headers()).get('x-aerotech-service-path')?.endsWith('/support'))return <SupportLayout>{children}</SupportLayout>;
 return <PortalFrame role="employee" navigation={EmployeeNav}>{children}</PortalFrame>;
}
