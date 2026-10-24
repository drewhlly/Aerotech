import Link from "next/link";
const email="aerotechhrsolutions@gmail.com";
export default function SupportPage(){
 return <main className="min-h-screen bg-slate-50 px-5 py-16"><section className="mx-auto max-w-xl rounded-2xl border bg-white p-8 shadow-sm"><Link href="/" className="text-sm text-indigo-700">Aerotech</Link><h1 className="mt-6 text-3xl font-bold text-slate-900">Contact Support</h1><p className="mt-3 text-slate-600">Need help with Aerotech? Reach our support team using the contact below.</p><a className="mt-7 block rounded-xl bg-slate-900 px-5 py-4 text-center font-semibold text-white" href={"mailto:"+email+"?subject=Aerotech%20Support%20Request"}>Email Support</a><p className="mt-4 text-center text-sm text-slate-700">{email}</p><p className="mt-6 text-sm text-slate-500">Phone support contact will appear once the official Aerotech number is confirmed. Never share passwords or one-time codes with support.</p></section></main>;
}
