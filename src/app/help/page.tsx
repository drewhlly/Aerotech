import Link from 'next/link';
import Help from '@/components/help-desk';
import {currentEmployer} from '@/lib/employer-session';
import {currentEmployee} from '@/lib/employee-auth';
import {currentApplicant} from '@/lib/applicant-session';
import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata('Help','Get help with your Aerotech account and workspace. Sign in to submit a private support ticket, follow replies and keep your company or application issue on file.','/help',false);
export default async function Page(){const signed=await currentEmployer(false)||await currentEmployee()||await currentApplicant();return signed?<Help/>:<main className="mx-auto max-w-xl px-5 py-16"><h1 className="text-3xl font-bold">How can we help?</h1><p className="my-5 leading-7 text-slate-600">Sign in to open a private support ticket and follow replies. For access problems or sales enquiries, contact us by email or phone.</p><Link href="/auth/login" className="aero-button bg-blue-700 text-white">Sign in for tickets</Link> <Link href="/support" className="aero-button text-blue-700">Contact support</Link></main>}
