import PasswordRecovery from '@/components/password-recovery';
import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata('Reset password','Set a new password for your Aerotech account using the private recovery link sent to your email. Expired or used links require a new password reset request.','/auth/reset-password',false);
export default function Page(){return <PasswordRecovery reset={true}/>}
