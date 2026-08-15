import { CalendarDays, Clock3, Video } from "lucide-react";
import { PortalShell } from "@/components/aerotech-portal";

export default function ApplicantInterviewsPage() {
  return (
    <PortalShell role="applicant">
      <h1 className="text-3xl font-black text-[#102A43]">Interviews</h1>
      <p className="mt-2 text-slate-500">Your upcoming and completed interviews.</p>

      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        {[
          ["HR & People Operations Manager", "Tomorrow", "10:00 AM"],
          ["Frontend Engineer", "Friday", "2:30 PM"],
        ].map(([role, day, time]) => (
          <div key={role} className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#E6F7F5] p-3 text-[#007F73]">
                <Video />
              </div>
              <div>
                <div className="font-black text-[#102A43]">{role}</div>
                <div className="text-sm text-slate-500">Video interview</div>
              </div>
            </div>

            <div className="mt-6 flex gap-5 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <CalendarDays size={16} />
                {day}
              </span>
              <span className="flex items-center gap-2">
                <Clock3 size={16} />
                {time}
              </span>
            </div>

            <button className="mt-6 w-full rounded-xl bg-[#102A43] px-4 py-3 font-bold text-white">
              Join interview
            </button>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}
