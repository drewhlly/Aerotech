import { ArrowRight, ClipboardCheck } from "lucide-react";
import { PortalShell } from "@/components/aerotech-portal";

export default function ApplicantAssessmentsPage() {
  return (
    <PortalShell role="applicant">
      <h1 className="text-3xl font-black text-[#102A43]">Assessments</h1>
      <p className="mt-2 text-slate-500">
        Complete assessments assigned by employers.
      </p>

      <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-[#E6F7F5] p-3 text-[#007F73]">
            <ClipboardCheck />
          </div>
          <div className="flex-1">
            <div className="font-black text-[#102A43]">
              Frontend Engineering Assessment
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Zentrix Innovations · 45 minutes
            </div>
            <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-700">
              Due within 3 days
            </div>
            <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#102A43] px-5 py-3 font-bold text-white">
              Start assessment
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
