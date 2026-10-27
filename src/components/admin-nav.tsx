'use client';
import {LayoutDashboard,ClipboardCheck,Bell} from 'lucide-react';
import PortalNav from './portal-nav';
export const adminLinks=[['/admin','Overview',LayoutDashboard],['/admin/vacancy-approvals','Vacancy approvals',ClipboardCheck],['/admin/support-cases','Support cases',Bell],['/admin/support','Support',Bell]] as const;
export default function AdminNav({close}:{close:()=>void}){return <PortalNav links={adminLinks} close={close}/>;}
