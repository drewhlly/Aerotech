import { BriefcaseBusiness, CheckCircle2, Clock3 } from "lucide-react";
import { PortalShell } from "@/components/aerotech-portal";

export default function ApplicantApplicationsPage() {
  const applications = [
    ["HR & People Operations Manager", "Aerotech Demo Company", "Interview"],
    ["Frontend Engineer", "Zentrix Innovations", "Assessment"],
    ["Finance & Payroll Officer", "Aerotech Demo Company", "Submitted"],
  ];

  return (
    <PortalShell role="applicant">
      <h1 className="text-3xl font-black text-[#102A43]">My applications</h1>
      <p className="mt-2 text-slate-500">
        Track every opportunity from application to offer.
      </p>

      <div className="mt-7 space-y-4">
        {applications.map(([title, company, status]) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="rounded-xl bg-[#E6F7F5] p-3 text-[#007F73]">
                <BriefcaseBusiness />
              </div>
              <div className="flex-1">
                <div className="font-black text-[#102A43]">{title}</div>
                <div className="mt-1 text-sm text-slate-500">{company}</div>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-[#E6F7F5] px-3 py-2 text-xs font-bold text-[#007F73]">
                {status === "Submitted" ? <Clock3 size={14} /> : <CheckCircle2 size={14} />}
                {status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}
