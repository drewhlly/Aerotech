import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata('Support','Contact Aerotech for account help, product questions or company sales enquiries. Reach our team by email or phone, or sign in to track a private support ticket.','/support');
import Link from "next/link";
import {supportContact,supportPhoneHref} from '@/lib/support-contact';
const {email,phone}=supportContact;const phoneHref=supportPhoneHref;
export default function SupportPage(){
 return <main className="min-h-screen bg-slate-50 px-5 py-16"><section className="mx-auto max-w-xl rounded-2xl border bg-white p-8 shadow-sm"><Link href="/" className="text-sm text-indigo-700">Aerotech</Link><h1 className="mt-6 text-3xl font-bold text-slate-900">Contact support</h1>

 <p className="mt-3 text-slate-600">Need help with Aerotech? Open a support ticket to track your issue and control temporary diagnostic access.</p><Link href="/help" className="mt-6 block rounded-xl bg-indigo-700 px-5 py-4 text-center font-semibold text-white">Open a ticket / support conversation</Link><a className="mt-7 block rounded-xl bg-slate-900 px-5 py-4 text-center font-semibold text-white" href={"mailto:"+email+"?subject=Aerotech%20Support%20Request"}>Email support</a><p className="mt-4 text-center text-sm text-slate-700">{email}</p><a href={phoneHref} className="mt-4 block rounded-xl border px-5 py-4 text-center font-semibold text-slate-900">Call support: {phone}</a><p className="mt-6 text-sm text-slate-500">Never share passwords or one-time codes with support.</p></section></main>;
}
