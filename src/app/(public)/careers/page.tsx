import {pageMetadata} from '@/lib/seo';import JobCatalogue from '@/components/job-catalogue';
export const metadata=pageMetadata('Careers','Find published jobs on Aerotech. Filter opportunities by location, department, salary and work type, then apply with your free applicant account.','/careers');
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string>>}){return <main className="mx-auto max-w-7xl px-5 py-12"><JobCatalogue params={await searchParams}/></main>}
