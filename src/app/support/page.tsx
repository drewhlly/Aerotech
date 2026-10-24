import Link from "next/link";
const email=process.env.SUPPORT_EMAIL||"aerotechhrsolutions@gmail.com";
const phone=process.env.SUPPORT_PHONE||"09045657917";
const phoneHref="tel:"+phone.replace(/[^+\d]/g,"");
const temporary=!process.env.SUPPORT_EMAIL||!process.env.SUPPORT_PHONE;
export default function SupportPage(){
 return <main className="min-h-screen bg-slate-50 px-5 py-16"><section className="mx-auto max-w-xl rounded-2xl border bg-white p-8 shadow-sm"><Link href="/" className="text-sm text-indigo-700">Aerotech</Link><h1 className="mt-6 text-3xl font-bold text-slate-900">Contact Support</h1>
 {temporary&&<p className="mt-5 rounded-lg border bg-slate-50 p-3 text-sm text-slate-600">Temporary contact details — subject to update.</p>}
 <p className="mt-3 text-slate-600">Need help with Aerotech? Reach the support contact below.</p><a className="mt-7 block rounded-xl bg-slate-900 px-5 py-4 text-center font-semibold text-white" href={"mailto:"+email+"?subject=Aerotech%20Support%20Request"}>Email Support</a><p className="mt-4 text-center text-sm text-slate-700">{email}</p><a href={phoneHref} className="mt-4 block rounded-xl border px-5 py-4 text-center font-semibold text-slate-900">Call Support: {phone}</a><p className="mt-6 text-sm text-slate-500">Never share passwords or one-time codes with support.</p></section></main>;
}
