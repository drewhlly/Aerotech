
import { Wallet, LockKeyhole } from "lucide-react";
export default function PayrollWalletPage() {
 return <main className="min-h-screen bg-slate-50 px-6 py-14">
  <div className="mx-auto max-w-3xl">
   
   <section className="mt-10 rounded-3xl border border-slate-200 bg-white px-8 py-16 text-center shadow-sm">
    <Wallet size={36} className="mx-auto text-[#2563eb]"/>
    <h1 className="mt-5 text-3xl font-black text-[#07152c]">Payroll Wallet — Coming Soon</h1>
    <p className="mx-auto mt-4 max-w-lg text-slate-600">Wallet funding, balance information and payroll payments are not available yet. We will enable this feature only after the necessary approvals and payment integrations are in place.</p>
    <div className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700"><LockKeyhole size={16}/> Wallet transactions disabled</div>
   </section>
  </div>
 </main>;
}
