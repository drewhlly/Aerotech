import {workspaceMetadata} from '@/lib/route-metadata';
export const generateMetadata=workspaceMetadata;
import {headers} from 'next/headers';
import {loginUrl} from '@/lib/auth-navigation';
import {redirect} from 'next/navigation';
import {currentApplicant} from '@/lib/applicant-session';
import {PortalFrame} from "@/components/workspace-shell";
import ApplicantNav from "@/components/applicant-nav";
import SupportLayout from "@/components/support-layout";
export default async function Layout({children}:{children:React.ReactNode}){if(!await currentApplicant())redirect(loginUrl('applicant',(await headers()).get('x-aerotech-return-path')||undefined));if((await headers()).get('x-aerotech-service-path')?.endsWith('/support'))return <SupportLayout>{children}</SupportLayout>;return <PortalFrame role="applicant" navigation={ApplicantNav}>{children}</PortalFrame>}
