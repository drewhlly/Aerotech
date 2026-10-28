"use client";
import {LayoutDashboard,BriefcaseBusiness,FileText,CalendarDays,ClipboardCheck,Bell} from 'lucide-react';
import PortalNav from './portal-nav';
export const applicantLinks=[['/applicant','Overview',LayoutDashboard],['/applicant/opportunities','Opportunities',BriefcaseBusiness],['/applicant/applications','Applications',FileText],['/applicant/documents','My documents',FileText],['/applicant/assessments','Assessments',ClipboardCheck],['/applicant/interviews','Interview planner',CalendarDays],['/applicant/support','Support',Bell],['/applicant/privacy','Privacy settings',Bell]] as const;
export default function ApplicantNav({close}:{close:()=>void}){return <PortalNav links={applicantLinks} close={close}/>;}
