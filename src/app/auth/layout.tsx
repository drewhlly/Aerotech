import {headers} from 'next/headers';
import PublicLayout from '@/components/public-layout';
// Activation is an explicit, token-authorised account transition, including for signed-in applicants.
export default async function AuthLayout({children}:{children:React.ReactNode}){const path=(await headers()).get('x-aerotech-service-path');if(path==='/auth/activate')return <>{children}</>;return <PublicLayout minimal={path==='/auth/login'}>{children}</PublicLayout>;}
