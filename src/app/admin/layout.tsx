import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {superAdmin} from '@/lib/super-admin';
import {PortalFrame} from '@/components/workspace-shell';
import AdminNav from '@/components/admin-nav';
import SupportLayout from '@/components/support-layout';
export {workspaceMetadata as generateMetadata} from '@/lib/route-metadata';
export default async function AdminLayout({children}:{children:React.ReactNode}){if(!await superAdmin())redirect('/support-console/login?next=/admin');if((await headers()).get('x-aerotech-service-path')?.endsWith('/support'))return <SupportLayout>{children}</SupportLayout>;return <PortalFrame role="admin" navigation={AdminNav}>{children}</PortalFrame>}
