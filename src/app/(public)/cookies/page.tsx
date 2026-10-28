import LegalPage from '@/components/legal-page';import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata('Cookie Policy','Read Aerotech’s cookie policy, including account responsibilities, data rights, privacy choices and contact information for questions about the service.','/cookies');
export default function Page(){return <LegalPage policy="cookies"/>}
