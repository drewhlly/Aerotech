import LegalPage from '@/components/legal-page';import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata('Privacy Policy','Read Aerotech’s privacy policy, including account responsibilities, data rights, privacy choices and contact information for questions about the service.','/privacy');
export default function Page(){return <LegalPage policy="privacy"/>}
