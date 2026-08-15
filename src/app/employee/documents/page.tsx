import { Download, FileText, FolderOpen } from "lucide-react";
import { PortalShell } from "@/components/aerotech-portal";

export default function EmployeeDocumentsPage() {
  const docs = [
    ["Employment Contract", "PDF", "12 Jan 2026"],
    ["Employee Handbook", "PDF", "12 Jan 2026"],
    ["Promotion Letter", "PDF", "01 Jun 2026"],
    ["Training Certificate", "PDF", "30 Jul 2026"],
  ];

  return (
    <PortalShell role="employee">
      <h1 className="text-3xl font-black text-[#102A43]">My documents</h1>
      <p className="mt-2 text-slate-500">
        Secure access to your employment documents.
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {docs.map(([title, type, date]) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                <FileText />
              </div>
              <div className="flex-1">
                <div className="font-black text-[#102A43]">{title}</div>
                <div className="text-xs text-slate-400">
                  {type} · {date}
                </div>
              </div>
              <button className="rounded-lg p-2 hover:bg-slate-100">
                <Download size={17} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}
