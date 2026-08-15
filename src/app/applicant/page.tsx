import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
} from "lucide-react";
import { PortalShell, StatCard } from "@/components/aerotech-portal";

export default function ApplicantDashboard() {
  return (
    <PortalShell role="applicant">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="text-sm font-semibold text-slate-400">Applicant</div>
          <h1 className="mt-1 text-3xl font-black text-[#102A43]">
            Welcome, Alex
          </h1>
          <p className="mt-2 text-slate-500">
            Keep your applications and career journey moving.
          </p>
        </div>

        <Link
          href="/jobs"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102A43] px-5 py-3 font-bold text-white"
        >
          Find jobs
          <ArrowRight size={17} />
        </Link>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Applications" value="6" detail="2 active" icon={BriefcaseBusiness} />
        <StatCard title="Interviews" value="2" detail="Next: tomorrow" icon={CalendarDays} />
        <StatCard title="Assessments" value="1" detail="Due this week" icon={ClipboardCheck} />
        <StatCard title="Profile" value="92%" detail="Almost complete" icon={CheckCircle2} />
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-black text-[#102A43]">Application activity</h2>

          <div className="mt-5 space-y-4">
            {[
              ["HR & People Operations Manager", "Interview scheduled", "Today"],
              ["Frontend Engineer", "Assessment completed", "Yesterday"],
              ["Finance & Payroll Officer", "Application submitted", "3 days ago"],
            ].map(([title, status, date]) => (
              <div key={title} className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                <div className="rounded-xl bg-white p-3">
                  <FileText size={18} className="text-[#007F73]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[#102A43]">{title}</div>
                  <div className="text-sm text-slate-500">{status}</div>
                </div>
                <div className="text-xs text-slate-400">{date}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-[#102A43] p-6 text-white">
          <div className="text-sm text-white/50">Career profile</div>
          <div className="mt-2 text-3xl font-black">92%</div>
          <div className="mt-4 h-2 rounded-full bg-white/10">
            <div className="h-2 w-[92%] rounded-full bg-[#00A896]" />
          </div>
          <p className="mt-5 text-sm leading-6 text-white/60">
            Complete your profile to improve your visibility to employers.
          </p>
          <button className="mt-5 rounded-xl bg-white px-4 py-3 text-sm font-black text-[#102A43]">
            Complete profile
          </button>
        </div>
      </div>
    </PortalShell>
  );
}
