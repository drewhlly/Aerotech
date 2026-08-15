import { CheckCircle2, Clock3, MapPin } from "lucide-react";
import { PortalShell } from "@/components/aerotech-portal";

export default function EmployeeAttendancePage() {
  return (
    <PortalShell role="employee">
      <h1 className="text-3xl font-black text-[#102A43]">Attendance</h1>
      <p className="mt-2 text-slate-500">
        Your attendance, clock-ins, shifts and work hours.
      </p>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl bg-[#102A43] p-7 text-white">
          <div className="text-sm text-white/50">Today</div>
          <div className="mt-2 text-4xl font-black">08:02 AM</div>
          <div className="mt-1 text-sm text-white/50">Clocked in</div>

          <button className="mt-8 w-full rounded-xl bg-[#00A896] px-5 py-3.5 font-black">
            Clock out
          </button>

          <div className="mt-5 flex items-center gap-2 text-xs text-white/50">
            <MapPin size={14} />
            Location verification enabled
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-7">
          <h2 className="font-black text-[#102A43]">This week</h2>
          <div className="mt-5 space-y-4">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
              (day, index) => (
                <div key={day} className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">{day}</span>
                  <span className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock3 size={15} />
                    {index < 4 ? "8h 12m" : "Today"}
                  </span>
                  {index < 4 && (
                    <CheckCircle2 size={17} className="text-[#00A896]" />
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
