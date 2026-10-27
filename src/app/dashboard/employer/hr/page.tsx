import Link from "next/link";
const sections=[
 ["Employee records","/dashboard/employer/employees","Add and review saved employee profiles"],
 ["HR requests","/dashboard/employer/requests","Review leave, expenses and other requests"],
 ["Attendance","/dashboard/employer/hr/attendance","Record and review attendance events"],
 ["Performance goals","/dashboard/employer/hr/goals","Set goals and view progress records"],
 ["Employee surveys","/dashboard/employer/hr/surveys","Create company pulse surveys"],
 ["Employee assets","/dashboard/employer/hr/assets","Assign and record company assets"],
 ["HR tasks","/dashboard/employer/hr/tasks","Track employee tasks"],
 ["Disciplinary cases","/dashboard/employer/hr/disciplinary","Document employee disciplinary cases"],
 ["Payroll","/dashboard/employer/payroll","Prepare payroll and review approval requirements"],
 ["Recruitment","/dashboard/employer/recruitment","Manage applicants and imports"],
 ["Aerotech AI","/dashboard/employer/ai","Ask the AI assistant when a model API key is configured"]
];
export default function HRHub(){return <section className="min-h-screen bg-slate-50 p-6 lg:p-10"><div className="mx-auto max-w-6xl"><Link href="/dashboard/employer" className="text-sm underline">Employer dashboard</Link><h1 className="mt-5 text-3xl font-black">Aerotech HR workspace</h1><p className="mt-2 max-w-3xl text-sm text-slate-600">Manage your workforce in one place. Some workflows require database configuration and additional approval or integration testing before launch.</p><div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{sections.map(([title,href,description])=><Link key={href} href={href} className="rounded-2xl border bg-white p-6 shadow-sm hover:border-indigo-400"><h2 className="font-bold text-slate-900">{title}</h2><p className="mt-2 text-sm text-slate-500">{description}</p><span className="mt-4 inline-block text-sm font-semibold text-indigo-700">Open →</span></Link>)}</div></div></section>}
