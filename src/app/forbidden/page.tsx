import Link from 'next/link';
import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata('Access restricted','This Aerotech workspace belongs to another account role. Return to your own portal, or choose the correct sign-in option to continue with authorised access.','/forbidden',false);
export default function Page(){return <main className="mx-auto max-w-xl px-6 py-20"><p>403</p><h1 className="my-4 text-3xl font-bold">This workspace needs a different account</h1><p>Your current role cannot access this portal.</p><Link href="/auth/login" className="aero-button mt-6 bg-blue-700 text-white">Choose the correct sign in</Link> <Link href="/" className="aero-button text-blue-700">Back to home</Link></main>}
