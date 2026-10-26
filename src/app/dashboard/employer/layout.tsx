import {loginUrl} from '@/lib/auth-navigation';
import {headers} from 'next/headers';import {planAllows,requiredPlan} from '@/lib/plan-access';
import WorkspaceShell from "@/components/workspace-shell";
import { redirect } from "next/navigation";
import { currentEmployer,db } from "@/lib/employer-session";

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const employerId = await currentEmployer(false);
  if (!employerId) redirect(loginUrl('employer',(await headers()).get('x-aerotech-return-path')||undefined));
  const p=db();try{const r=await p.query("SELECT a.subscription_required,s.plan,s.status,s.paid_until FROM employer_accounts a LEFT JOIN company_subscriptions s ON s.employer_id=a.id WHERE a.id=$1",[employerId]);const a=r.rows[0];if(a.subscription_required&&(!a.paid_until||new Date(a.paid_until)<=new Date()||a.status!=='active'))redirect('/billing');if(a.subscription_required&&!planAllows(a.plan,(await headers()).get('x-aerotech-service-path')||''))redirect('/billing?required='+requiredPlan((await headers()).get('x-aerotech-service-path')||''))}finally{await p.end()}
  return <WorkspaceShell role="employer">{children}</WorkspaceShell>;
}
