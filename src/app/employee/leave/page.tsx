import { CalendarDays, Plus, Umbrella } from "lucide-react";
import { PortalShell } from "@/components/aerotech-portal";

export default function EmployeeLeavePage() {
  return (
    <PortalShell role="employee">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-black text-[#102A43]">Leave</h1>
          <p className="mt-2 text-slate-500">
            Manage your leave entitlement and requests.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102A43] px-5 py-3 font-bold text-white">
          <Plus size={17} />
          Request leave
        </button>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-sm text-slate-400">Annual entitlement</div>
          <div className="mt-2 text-3xl font-black text-[#102A43]">14</div>
          <div className="text-xs text-slate-400">days</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-sm text-slate-400">Used</div>
          <div className="mt-2 text-3xl font-black text-[#102A43]">6</div>
          <div className="text-xs text-slate-400">days</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-sm text-slate-400">Remaining</div>
          <div className="mt-2 text-3xl font-black text-[#007F73]">8</div>
          <div className="text-xs text-slate-400">days</div>
        </div>
      </div>

      <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-black text-[#102A43]">Recent requests</h2>

        <div className="mt-5 space-y-3">
          {[
            ["Annual leave", "12 Aug – 15 Aug", "Approved"],
            ["Personal leave", "22 Jul", "Approved"],
          ].map(([type, date, status]) => (
            <div key={type} className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
              <Umbrella className="text-[#007F73]" size={19} />
              <div className="flex-1">
                <div className="font-bold text-[#102A43]">{type}</div>
                <div className="text-sm text-slate-500">{date}</div>
              </div>
              <div className="rounded-full bg-[#E6F7F5] px-3 py-1 text-xs font-bold text-[#007F73]">
                {status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
