import LegalPage from '@/components/legal-page';import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata('Terms of Service','Read Aerotech’s terms of service, including account responsibilities, data rights, privacy choices and contact information for questions about the service.','/terms');
export default function Page(){return <LegalPage policy="terms"/>}
