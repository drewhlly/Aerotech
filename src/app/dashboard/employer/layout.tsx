import {workspaceMetadata} from '@/lib/route-metadata';
export const generateMetadata=workspaceMetadata;
import {loginUrl} from '@/lib/auth-navigation';
import {headers} from 'next/headers';import {requiredPlan} from '@/lib/plan-access';
import {PortalFrame} from "@/components/workspace-shell";
import EmployerNav from "@/components/employer-nav";
import SupportLayout from "@/components/support-layout";
import { redirect } from "next/navigation";
import { currentEmployer } from "@/lib/employer-session";

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const employerId = await currentEmployer(false);
  if (!employerId) redirect(loginUrl('employer',(await headers()).get('x-aerotech-return-path')||undefined));
  if((await headers()).get('x-aerotech-service-path')?.endsWith('/support'))return <SupportLayout>{children}</SupportLayout>;
  if((await headers()).get('x-aerotech-service-path')?.includes('/billing/')||(await headers()).get('x-aerotech-service-path')==='/dashboard/employer/privacy')return <PortalFrame role="employer" navigation={EmployerNav}>{children}</PortalFrame>;
  if(!await currentEmployer())redirect('/dashboard/employer/billing/plans?required='+requiredPlan((await headers()).get('x-aerotech-service-path')||''));
  return <PortalFrame role="employer" navigation={EmployerNav}>{children}</PortalFrame>;
}
