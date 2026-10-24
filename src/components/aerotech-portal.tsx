"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Wallet,
  X,
  Banknote,
  ClipboardCheck,
  HeartHandshake,
  LogOut,
} from "lucide-react";

export const AEROTECH = {
  name: "Aerotech",
  tagline: "The operating system for modern work.",
  primary: "#102A43",
  accent: "#00A896",
};

export const jobs = [
  {
    id: "job-001",
    title: "HR & People Operations Manager",
    company: "Aerotech Demo Company",
    location: "Lagos, Nigeria",
    type: "Full-time",
    department: "People",
    salary: "₦500,000 – ₦750,000",
    description:
      "Lead people operations, employee experience, workforce planning and HR compliance.",
  },
  {
    id: "job-002",
    title: "Frontend Engineer",
    company: "Zentrix Innovations",
    location: "Remote",
    type: "Full-time",
    department: "Engineering",
    salary: "₦700,000 – ₦1,200,000",
    description:
      "Build scalable digital products using React, Next.js and modern frontend technologies.",
  },
  {
    id: "job-003",
    title: "Finance & Payroll Officer",
    company: "Aerotech Demo Company",
    location: "Lagos, Nigeria",
    type: "Full-time",
    department: "Finance",
    salary: "₦350,000 – ₦500,000",
    description:
      "Support payroll processing, statutory deductions, reconciliations and financial reporting.",
  },
];

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          light ? "bg-white text-[#102A43]" : "bg-[#102A43] text-white"
        }`}
      >
        <Sparkles size={21} />
      </div>
      <div>
        <div
          className={`text-lg font-black tracking-tight ${
            light ? "text-white" : "text-[#102A43]"
          }`}
        >
          Aerotech
        </div>
        <div
          className={`text-[10px] font-semibold uppercase tracking-widest ${
            light ? "text-white/60" : "text-slate-400"
          }`}
        >
          Work OS
        </div>
      </div>
    </Link>
  );
}

export function PublicNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Logo />

        <nav className="hidden items-center gap-7 lg:flex">
          <Link href="/auth/signup/applicant" className="text-sm font-medium text-slate-600 hover:text-[#102A43]">Applicant signup</Link><Link href="/jobs" className="text-sm font-medium text-slate-600 hover:text-[#102A43]">
            Find Jobs
          </Link>
          <Link href="/#solutions" className="text-sm font-medium text-slate-600 hover:text-[#102A43]">
            Solutions
          </Link>
          <Link href="/#payroll" className="text-sm font-medium text-slate-600 hover:text-[#102A43]">
            Payroll
          </Link>
          <Link href="/#training" className="text-sm font-medium text-slate-600 hover:text-[#102A43]">
            Training
          </Link>
          <Link href="/#ai" className="text-sm font-medium text-slate-600 hover:text-[#102A43]">
            AI
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-[#102A43]">
            Pricing
          </Link>
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/auth/login"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup/employer"
            className="rounded-xl bg-[#102A43] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#183B56]"
          >
            Start with Aerotech
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 lg:hidden"
          aria-label="Open navigation"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-5 py-5 lg:hidden">
          <div className="grid gap-3">
            <Link href="/auth/signup/applicant" className="rounded-lg p-3 hover:bg-slate-50">Applicant signup</Link><Link href="/pricing" className="rounded-lg p-3 hover:bg-slate-50">Pricing</Link><Link href="/jobs" className="rounded-lg p-3 hover:bg-slate-50">
              Find Jobs
            </Link>
            <Link href="/#solutions" className="rounded-lg p-3 hover:bg-slate-50">
              Solutions
            </Link>
            <Link href="/#payroll" className="rounded-lg p-3 hover:bg-slate-50">
              Payroll
            </Link>
            <Link href="/auth/login" className="rounded-lg p-3 hover:bg-slate-50">
              Sign in
            </Link>
            <Link
              href="/auth/signup/employer"
              className="rounded-xl bg-[#102A43] p-3 text-center font-bold text-white"
            >
              Start with Aerotech
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function PortalShell({children,role="employee"}:{children:React.ReactNode;role?:"employee"|"applicant"|"employer"}){
 const router=useRouter();const [open,setOpen]=useState(false),[busy,setBusy]=useState(false);
 const links=role==="employee"?[["/employee","Dashboard",LayoutDashboard],["/employee/profile","My profile",User],["/employee/attendance","Attendance",Clock3],["/employee/payroll/statements","Payslips",Banknote],["/employee/surveys","Pulse surveys",ClipboardCheck],["/employee/birthdays","Birthdays",CalendarDays],["/employee/notifications","Notifications",Bell],["/employee/documents","Documents",FileText],["/meet","Aerotech Meet",MessageSquare]] as const:role==="applicant"?[["/applicant","Overview",LayoutDashboard],["/jobs","Find jobs",Search],["/applicant/applications","Applications",BriefcaseBusiness]] as const:[["/dashboard/employer","Dashboard",LayoutDashboard]] as const;
 async function signOut(){setBusy(true);try{const r=await fetch(role==="employee"?"/api/auth/logout/employee":role==="applicant"?"/api/auth/logout/applicant":"/api/auth/logout",{method:"POST"});if(!r.ok)throw Error("Unable to sign out");window.location.assign("/auth/login?role="+role);}catch{setBusy(false);window.alert("Unable to sign out. Please try again.");}}
 return <div className="min-h-screen bg-gradient-to-br from-[#eaf5ff] via-[#f7f9ff] to-[#f2efff] text-slate-900">
 <aside className={`fixed inset-y-0 left-0 z-50 w-[270px] transform bg-[#07111f] text-white transition-transform lg:translate-x-0 ${open?"translate-x-0":"-translate-x-full"}`}>
 <div className="flex h-full flex-col"><div className="border-b border-white/10 px-6 py-6"><div className="text-xl font-black tracking-[.2em] text-white">AEROTECH</div><p className="mt-1 text-xs tracking-wide text-slate-400">People. Performance. Progress.</p></div><nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6"><p className="px-3 pb-3 text-[11px] font-bold tracking-widest text-slate-500">{role.toUpperCase()} WORKSPACE</p>{links.map(([href,label,Icon])=><Link key={href} href={href} onClick={()=>setOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white"><Icon size={18} className="text-cyan-400"/>{label}</Link>)}</nav><div className="border-t border-white/10 p-4"><button disabled={busy} onClick={signOut} className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"><LogOut size={17}/>Log out</button></div></div></aside>
 {open&&<button aria-label="Close navigation" onClick={()=>setOpen(false)} className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"/>}
 <div className="lg:pl-[270px]"><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur"><div className="flex items-center gap-3"><button aria-label="Open navigation" onClick={()=>setOpen(true)} className="rounded-xl border p-2 lg:hidden"><Menu size={20}/></button><span className="text-sm font-bold text-[#102a43]">Aerotech / {role==="employee"?"Employee workspace":role==="applicant"?"Applicant portal":"Employer workspace"}</span></div><div className="flex items-center gap-3"><Link href={role==="employee"?"/employee/notifications":"/dashboard/employer"} aria-label="Notifications" className="rounded-xl p-2 text-slate-500"><Bell size={20}/></Link><Link href={role==="employee"?"/employee/profile":"/applicant"} aria-label="My profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 text-white"><User size={18}/></Link></div></header>
 <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8"><div className="mb-6 flex items-center justify-between"><button onClick={()=>{if(window.history.length>1)router.back();else router.push(role==="employee"?"/employee":"/applicant");}} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-semibold"><ArrowLeft size={16}/>Back</button><button disabled={busy} onClick={signOut} className="inline-flex items-center gap-2 rounded-xl bg-[#07111f] px-4 py-2 text-sm font-semibold text-white"><LogOut size={16}/>Log out</button></div>{children}</main></div></div>;
}


export function StatCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-slate-500">{title}</div>
          <div className="mt-2 text-2xl font-black text-[#102A43]">{value}</div>
          <div className="mt-1 text-xs font-medium text-slate-400">{detail}</div>
        </div>
        <div className="rounded-xl bg-[#E6F7F5] p-3 text-[#007F73]">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export function AIBox() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  function ask() {
    if (!question.trim()) return;

    setAnswer(
      "Aerotech AI can help with workforce insights, recruitment, payroll explanations, attendance analysis, training recommendations and HR policy guidance. In production this panel will connect to your organisation's secured AI layer."
    );
  }

  return (
    <div className="rounded-2xl bg-[#102A43] p-6 text-white shadow-sm">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-white/10 p-3">
          <Sparkles size={22} />
        </div>
        <div className="flex-1">
          <div className="text-lg font-black">Aerotech AI</div>
          <div className="mt-1 text-sm text-white/60">
            Your intelligent HR and workforce copilot.
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") ask();
          }}
          placeholder="Ask about your workforce..."
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
        />
        <button
          onClick={ask}
          className="rounded-xl bg-[#00A896] px-4 py-3 font-bold text-white"
        >
          Ask
        </button>
      </div>

      {answer && (
        <div className="mt-4 rounded-xl bg-white/10 p-4 text-sm leading-6 text-white/80">
          {answer}
        </div>
      )}
    </div>
  );
}

export function JobCard({ job }: { job: (typeof jobs)[number] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F7F5] text-[#007F73]">
          <Building2 size={20} />
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
          {job.type}
        </span>
      </div>

      <h3 className="mt-5 text-lg font-black text-[#102A43]">{job.title}</h3>
      <p className="mt-1 text-sm font-semibold text-slate-500">{job.company}</p>

      <div className="mt-4 space-y-2 text-sm text-slate-500">
        <div>{job.location}</div>
        <div>{job.department}</div>
        <div className="font-bold text-[#007F73]">{job.salary}</div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
        {job.description}
      </p>

      <Link
        href={`/jobs/${job.id}`}
        className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#102A43] px-4 py-3 text-sm font-bold text-white"
      >
        View opportunity
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

export function WalletFundingCard() {
  const [amount, setAmount] = useState("3920000");
  const [method, setMethod] = useState("bank");

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#E6F7F5] p-3 text-[#007F73]">
            <Wallet size={22} />
          </div>
          <div>
            <h2 className="font-black text-[#102A43]">Fund payroll wallet</h2>
            <p className="text-sm text-slate-500">
              Add funds before approving your payroll.
            </p>
          </div>
        </div>

        <label className="mt-6 block text-sm font-bold text-slate-700">
          Amount
        </label>
        <div className="mt-2 flex items-center rounded-xl border border-slate-200 px-4">
          <span className="font-bold text-slate-400">₦</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            className="w-full bg-transparent px-3 py-3 text-lg font-bold outline-none"
          />
        </div>

        <label className="mt-5 block text-sm font-bold text-slate-700">
          Payment method
        </label>

        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => setMethod("bank")}
            className={`rounded-xl border p-4 text-left ${
              method === "bank"
                ? "border-[#00A896] bg-[#E6F7F5]"
                : "border-slate-200"
            }`}
          >
            <Banknote size={19} />
            <div className="mt-2 font-bold">Bank transfer</div>
            <div className="text-xs text-slate-500">
              Generate a payment reference
            </div>
          </button>

          <button
            onClick={() => setMethod("card")}
            className={`rounded-xl border p-4 text-left ${
              method === "card"
                ? "border-[#00A896] bg-[#E6F7F5]"
                : "border-slate-200"
            }`}
          >
            <CreditCard size={19} />
            <div className="mt-2 font-bold">Card</div>
            <div className="text-xs text-slate-500">
              Pay using a supported card gateway
            </div>
          </button>
        </div>

        <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#102A43] px-5 py-3.5 font-bold text-white">
          Continue to payment
          <ArrowRight size={17} />
        </button>

        <p className="mt-3 text-center text-xs text-slate-400">
          Payment gateway connection will be completed when production payments
          are connected.
        </p>
      </div>

      <div className="rounded-2xl bg-[#102A43] p-6 text-white">
        <div className="text-sm text-white/60">Funding preview</div>
        <div className="mt-3 text-3xl font-black">
          ₦{Number(amount || 0).toLocaleString()}
        </div>
        <div className="mt-1 text-sm text-white/50">
          {method === "bank" ? "Bank transfer" : "Card payment"}
        </div>

        <div className="my-6 border-t border-white/10" />

        <div className="space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Current wallet</span>
            <span>₦4,850,000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Payroll requirement</span>
            <span>₦3,920,000</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Projected balance</span>
            <span>₦8,770,000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
