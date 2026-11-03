import EmployeeAccessSignOut from '@/components/employee-access-sign-out';
import Link from 'next/link';
import {redirect} from 'next/navigation';
import {currentEmployee} from '@/lib/employee-auth';
export default async function EmployeeAccess(){
 if(await currentEmployee())redirect('/employee');
 return <main className="mx-auto max-w-xl px-5 py-16"><section className="aero-card"><h1 className="text-3xl font-semibold">Your company subscription needs attention</h1><p className="mt-4 leading-7 text-slate-600">Your workspace will be available when your employer activates or renews the company subscription. Please contact your HR team. Employees do not pay an individual subscription.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/employee" className="aero-button border">Check access again</Link><Link href="/employee/support" className="aero-button bg-blue-700 text-white">Contact support</Link><Link href="/employee/privacy" className="aero-button border">Privacy settings</Link></div><EmployeeAccessSignOut/></section></main>;
}
