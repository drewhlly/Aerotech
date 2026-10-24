"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, UserRound, CalendarDays, GraduationCap, BriefcaseBusiness } from "lucide-react";
import { employerOSData } from "@/lib/aerotech";

export default function Employee360Page() {
 const { id } = useParams<{id:string}>();
 const employee = employerOSData.workforce.find(item => item.id === id);
 if (!employee) return <main className="mx-auto max-w-xl px-6 py-20 text-center"><h1 className="text-2xl font-bold">Employee not found</h1><p className="mt-3 text-slate-500">This employee is not in the current workforce list.</p><Link className="mt-5 inline-block underline" href="/dashboard/employer/employees">Back to employees</Link></main>;
 return <main className="min-h-screen bg-slate-50 px-6 py-10">
  <div className="mx-auto max-w-5xl">
   <Link href="/dashboard/employer/employees" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><ArrowLeft size={16}/> Back to employees</Link>
   <div className="mt-6 rounded-2xl border bg-white p-8 shadow-sm">
    <div className="flex items-center gap-4"><div className="rounded-xl bg-indigo-50 p-4 text-indigo-700"><UserRound size={28}/></div><div><h1 className="text-3xl font-bold text-[#102A43]">{employee.name}</h1><p className="mt-1 text-slate-500">{employee.position} · {employee.department}</p></div></div>
    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Info label="Employee ID" value={employee.id}/>
      <Info label="Location" value={employee.location}/>
      <Info label="Employment status" value={employee.status}/>
      <Info label="Department" value={employee.department}/>
    </div>
   </div>
   <div className="mt-6 grid gap-4 sm:grid-cols-3">
    <Metric icon={<CalendarDays size={20}/>} label="Attendance" value={employee.attendance+"%"}/>
    <Metric icon={<GraduationCap size={20}/>} label="Training" value={employee.training+"%"}/>
    <Metric icon={<BriefcaseBusiness size={20}/>} label="Performance" value={employee.performance+"/5"}/>
   </div>
   <p className="mt-6 text-sm text-slate-500">This profile currently displays the same demo workforce records as the employee directory. Payroll, personal documents and statutory details will appear when real employee records are connected.</p>
  </div>
 </main>;
}
function Info({label,value}:{label:string;value:string}) {return <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs text-slate-500">{label}</div><div className="mt-2 font-semibold">{value}</div></div>;}
function Metric({icon,label,value}:{icon:React.ReactNode;label:string;value:string}) {return <div className="rounded-xl border bg-white p-6"><div className="text-slate-500">{icon}</div><div className="mt-3 text-sm text-slate-500">{label}</div><div className="text-2xl font-bold">{value}</div></div>;}
