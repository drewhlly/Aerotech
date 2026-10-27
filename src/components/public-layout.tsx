import {redirect} from 'next/navigation';
import {activePortal} from '@/lib/active-portal';
import {workspaceHomes} from '@/lib/portal-policy';
import {PublicNav} from './aerotech-portal';
import CookieNotice from './cookie-notice';
import PublicFooter from './public-footer';
export default async function PublicLayout({children}:{children:React.ReactNode}){
 const role=await activePortal();
 if(role)redirect(role==='support'?'/support-console':workspaceHomes[role]);
 return <><PublicNav/>{children}<PublicFooter/><CookieNotice/></>;
}
