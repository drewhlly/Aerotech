import Link from "next/link";
import {
  Award,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  Heart,
  Monitor,
  MessageCircle,
  Presentation,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  AIAssistant,
  DashboardShell,
  PageHeader,
} from "@/components/aerotech-ui";
import { employerOSData } from "@/lib/aerotech";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  presentation: Presentation,
  monitor: Monitor,
  briefcase: BriefcaseBusiness,
  shield: ShieldCheck,
  award: Award,
  users: Users,
  message: MessageCircle,
  heart: Heart,
};

export default function TrainingPage() {
  return (
    <>
      <DashboardShell title="Training & Development">
        <PageHeader
          eyebrow="LEARNING & DEVELOPMENT"
          title="Training & Development"
          description="Build, assign, track and measure employee learning."
          action={
            <Link
              href="/dashboard/employer/training/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#9D4EDD] px-4 py-2.5 text-xs font-bold text-white"
            >
              Create training
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-slate-500">Completion</p>
            <p className="mt-2 text-3xl font-black">78%</p>
            <p className="mt-1 text-[10px] text-emerald-600">
              +8% this quarter
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-slate-500">Active programmes</p>
            <p className="mt-2 text-3xl font-black">14</p>
            <p className="mt-1 text-[10px] text-indigo-600">
              Across departments
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-slate-500">Mandatory overdue</p>
            <p className="mt-2 text-3xl font-black">6</p>
            <p className="mt-1 text-[10px] text-amber-600">
              Requires action
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-indigo-600" />
            <div>
              <h2 className="text-sm font-bold">Training types</h2>
              <p className="mt-1 text-xs text-slate-500">
                Aerotech supports multiple learning formats.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {employerOSData.trainingTypes.map((training) => {
              const Icon = icons[training.icon] ?? GraduationCap;

              return (
                <div
                  key={training.name}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                    <Icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <p className="mt-4 text-xs font-bold">{training.name}</p>
                  <p className="mt-2 text-[10px] leading-5 text-slate-500">
                    {training.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold">Learning controls</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              "Course catalogue",
              "Learning paths",
              "Employee assignments",
              "Attendance capture",
              "Assessments",
              "Certificates",
              "Mandatory training",
              "Training budgets",
              "Training vendors",
              "Completion analytics",
              "Expiry reminders",
              "AI recommendations",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-600"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </DashboardShell>

      <AIAssistant />
    </>
  );
}
