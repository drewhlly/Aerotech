import {workspaceMetadata} from '@/lib/route-metadata';
export const generateMetadata=workspaceMetadata;
import {loginUrl} from '@/lib/auth-navigation';
import {headers} from 'next/headers';import {planAllows,requiredPlan} from '@/lib/plan-access';
import {PortalFrame} from "@/components/workspace-shell";
import EmployerNav from "@/components/employer-nav";
import SupportLayout from "@/components/support-layout";
import { redirect } from "next/navigation";
import { currentEmployer,db } from "@/lib/employer-session";

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const employerId = await currentEmployer(false);
  if (!employerId) redirect(loginUrl('employer',(await headers()).get('x-aerotech-return-path')||undefined));
  if((await headers()).get('x-aerotech-service-path')?.endsWith('/support'))return <SupportLayout>{children}</SupportLayout>;
  if((await headers()).get('x-aerotech-service-path')?.includes('/billing/'))return <PortalFrame role="employer" navigation={EmployerNav}>{children}</PortalFrame>;
  const p=db();try{const r=await p.query("SELECT a.subscription_required,s.plan,s.status,s.paid_until FROM employer_accounts a LEFT JOIN company_subscriptions s ON s.employer_id=a.id WHERE a.id=$1",[employerId]);const a=r.rows[0];if(a.subscription_required&&(!a.paid_until||new Date(a.paid_until)<=new Date()||a.status!=='active'))redirect('/dashboard/employer/billing/plans');if(a.subscription_required&&!planAllows(a.plan,(await headers()).get('x-aerotech-service-path')||''))redirect('/dashboard/employer/billing/plans?required='+requiredPlan((await headers()).get('x-aerotech-service-path')||''))}finally{await p.end()}
  return <PortalFrame role="employer" navigation={EmployerNav}>{children}</PortalFrame>;
}
