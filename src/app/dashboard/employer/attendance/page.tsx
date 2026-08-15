import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  MapPin,
  QrCode,
  Smartphone,
  UserCheck,
} from "lucide-react";
import {
  AIAssistant,
  DashboardShell,
  PageHeader,
} from "@/components/aerotech-ui";
import { employerOSData } from "@/lib/aerotech";

const methodIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Web clock-in/out": Clock3,
  "Mobile attendance": Smartphone,
  "QR attendance": QrCode,
  "GPS / Geofencing": MapPin,
  "Biometric integration": UserCheck,
  "Admin correction": CalendarCheck2,
  "Shift attendance": CheckCircle2,
};

export default function AttendancePage() {
  return (
    <>
      <DashboardShell title="Attendance">
        <PageHeader
          eyebrow="WORKFORCE TIME"
          title="Attendance"
          description="Capture, approve and analyse employee attendance across locations."
          action={
            <Link
              href="/dashboard/employer/attendance/shifts"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold"
            >
              Manage shifts
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-slate-500">Attendance rate</p>
            <p className="mt-2 text-3xl font-black">96%</p>
            <p className="mt-1 text-[10px] text-emerald-600">This month</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-slate-500">Present today</p>
            <p className="mt-2 text-3xl font-black">221</p>
            <p className="mt-1 text-[10px] text-indigo-600">Out of 231 active</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-slate-500">Exceptions</p>
            <p className="mt-2 text-3xl font-black">10</p>
            <p className="mt-1 text-[10px] text-amber-600">Needs review</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold">Attendance capture methods</h2>
          <p className="mt-1 text-xs text-slate-500">
            Employers can enable one or multiple methods depending on location
            and workforce policy.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {employerOSData.attendanceMethods.map((method) => {
              const Icon = methodIcons[method.name] ?? CalendarCheck2;

              return (
                <div
                  key={method.name}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50">
                      <Icon className="h-5 w-5 text-cyan-600" />
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">
                      {method.status}
                    </span>
                  </div>
                  <p className="mt-4 text-xs font-bold">{method.name}</p>
                  <p className="mt-2 text-[10px] leading-5 text-slate-500">
                    {method.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-bold">Attendance workflow</h2>
            <div className="mt-5 space-y-3">
              {[
                "Employee clocks in",
                "System records time and method",
                "Location / shift validation",
                "Manager reviews exceptions",
                "Attendance is approved",
                "Payroll receives approved attendance",
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600">
                    {index + 1}
                  </div>
                  <span className="text-xs text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-[#07111f] p-6 text-white">
            <h2 className="text-sm font-bold">Payroll connection</h2>
            <p className="mt-2 text-xs leading-6 text-slate-400">
              Approved attendance can feed shift pay, overtime, lateness,
              absence and payroll calculations once the production backend is
              connected.
            </p>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] text-slate-500">Current attendance</p>
              <p className="mt-1 text-2xl font-black">96%</p>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-full w-[96%] rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500" />
              </div>
            </div>
          </div>
        </div>
      </DashboardShell>

      <AIAssistant />
    </>
  );
}
