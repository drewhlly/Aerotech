import {redirect} from 'next/navigation';
import {activePortal} from '@/lib/active-portal';
import {workspaceHomes} from '@/lib/portal-policy';
import {PublicNav} from './aerotech-portal';
import PublicFooter from './public-footer';
async function PublicLayoutContent({children,minimal=false}:{children:React.ReactNode;minimal?:boolean}){
 const role=await activePortal();
 if(role)redirect(role==='support'?'/support-console':workspaceHomes[role]);
 return minimal?<>{children}</>:<><PublicNav/>{children}<PublicFooter/></>;
}
export default function PublicLayout({children}:{children:React.ReactNode}){return <PublicLayoutContent>{children}</PublicLayoutContent>}
export function MinimalPublicLayout({children}:{children:React.ReactNode}){return <PublicLayoutContent minimal>{children}</PublicLayoutContent>}
