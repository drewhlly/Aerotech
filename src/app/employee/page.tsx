import {
  Banknote,
  CalendarDays,
  Clock3,
  FileText,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { AIBox, PortalShell, StatCard } from "@/components/aerotech-portal";

export default function EmployeeDashboard() {
  return (
    <PortalShell role="employee">
      <div>
        <div className="text-sm text-slate-400">Employee 360</div>
        <h1 className="mt-1 text-3xl font-black text-[#102A43]">
          Welcome back, Alex
        </h1>
        <p className="mt-2 text-slate-500">
          Here is everything happening across your work life.
        </p>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Attendance" value="96%" detail="This month" icon={Clock3} />
        <StatCard title="Leave balance" value="8 days" detail="Remaining" icon={CalendarDays} />
        <StatCard title="Training" value="72%" detail="Learning progress" icon={GraduationCap} />
        <StatCard title="Latest pay" value="₦420k" detail="Net pay" icon={Banknote} />
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-black text-[#102A43]">My workday</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              ["Clock in", "08:02 AM", "Completed"],
              ["Break", "12:30 PM", "Completed"],
              ["Clock out", "05:00 PM", "Pending"],
            ].map(([a, b, c]) => (
              <div key={a} className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs text-slate-400">{a}</div>
                <div className="mt-2 text-xl font-black text-[#102A43]">{b}</div>
                <div className="mt-1 text-xs font-semibold text-[#007F73]">{c}</div>
              </div>
            ))}
          </div>

          <div className="mt-7 border-t border-slate-200 pt-6">
            <h2 className="font-black text-[#102A43]">Recent activity</h2>
            <div className="mt-4 space-y-3">
              {[
                "Completed Workplace Safety training",
                "Payslip generated for July",
                "Leave request approved",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="h-2 w-2 rounded-full bg-[#00A896]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <AIBox />
      </div>
    </PortalShell>
  );
}
