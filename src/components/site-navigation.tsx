"use client";
import {usePathname} from 'next/navigation';import {PublicNav,PublicNavigationContext} from './aerotech-portal';
export default function SiteNavigation({children}:{children:React.ReactNode}){const path=usePathname();const workspace=['/dashboard','/employee','/applicant','/meet','/jobs','/aerochat','/admin','/help'].some(p=>path===p||path.startsWith(p+'/'));return <>{!workspace&&<><PublicNav/></>}<PublicNavigationContext.Provider value={!workspace}>{children}</PublicNavigationContext.Provider></>}
