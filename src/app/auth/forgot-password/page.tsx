import PasswordRecovery from '@/components/password-recovery';
import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata('Forgot password','Recover access to your Aerotech account with a private, time-limited email link. Choose your account role and contact support if you need help signing in.','/auth/forgot-password',false);
export default function Page(){return <PasswordRecovery reset={false}/>}
