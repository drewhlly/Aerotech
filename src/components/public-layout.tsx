import {redirect} from 'next/navigation';
import {activePortal} from '@/lib/active-portal';
import {workspaceHomes} from '@/lib/portal-policy';
import {PublicNav} from './aerotech-portal';
import PublicFooter from './public-footer';
export default async function PublicLayout({children,minimal=false}:{children:React.ReactNode;minimal?:boolean}){
 const role=await activePortal();
 if(role)redirect(role==='support'?'/support-console':workspaceHomes[role]);
 return minimal?<>{children}</>:<><PublicNav/>{children}<PublicFooter/></>;
}
