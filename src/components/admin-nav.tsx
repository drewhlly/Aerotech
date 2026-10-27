'use client';
import {LayoutDashboard,Bell} from 'lucide-react';
import PortalNav from './portal-nav';
export const adminLinks=[['/admin','Overview',LayoutDashboard],['/admin/safeguards','Safeguards & privacy',Bell],['/admin/support-cases','Support cases',Bell],['/admin/support','Support',Bell],['/admin/privacy','Privacy settings',Bell]] as const;
export default function AdminNav({close}:{close:()=>void}){return <PortalNav links={adminLinks} close={close}/>;}
