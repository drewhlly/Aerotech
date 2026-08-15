import { BookOpen, CheckCircle2, GraduationCap, PlayCircle } from "lucide-react";
import { PortalShell } from "@/components/aerotech-portal";

export default function EmployeeTrainingPage() {
  const courses = [
    ["Workplace Health & Safety", "Mandatory", 100],
    ["Food Safety & Hygiene", "Mandatory", 80],
    ["Leadership Essentials", "Development", 45],
    ["Customer Experience", "Development", 20],
  ];

  return (
    <PortalShell role="employee">
      <h1 className="text-3xl font-black text-[#102A43]">Training & L&D</h1>
      <p className="mt-2 text-slate-500">
        Your learning paths, courses and certifications.
      </p>

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        {courses.map(([title, type, progress]) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-[#E6F7F5] p-3 text-[#007F73]">
                <GraduationCap />
              </div>
              <div className="flex-1">
                <div className="font-black text-[#102A43]">{title}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                  {type}
                </div>
              </div>
              {progress === 100 && (
                <CheckCircle2 className="text-[#00A896]" />
              )}
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-[#00A896]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <button className="mt-5 flex items-center gap-2 text-sm font-bold text-[#007F73]">
              {progress === 100 ? <BookOpen size={16} /> : <PlayCircle size={16} />}
              {progress === 100 ? "Review course" : "Continue learning"}
            </button>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}
