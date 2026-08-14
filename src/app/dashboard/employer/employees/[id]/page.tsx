"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";

const employee = {
  name: "Amara Okafor",
  employeeId: "AER-EMP-001",
  role: "Human Resources Manager",
  department: "Human Resources",
  status: "Active",
  employmentType: "Full-time",
  location: "Lagos, Nigeria",
  email: "amara.okafor@example.com",
  phone: "+234 801 234 5678",
  startDate: "January 15, 2024",
  manager: "Head of People",
  avatar: "AO",
};

const sections = [
  {
    title: "Documents",
    description: "Contracts, identification, certificates and HR documents",
    href: "documents",
    icon: FileText,
  },
  {
    title: "Compensation",
    description: "Salary, allowances, benefits and compensation history",
    href: "compensation",
    icon: WalletCards,
  },
  {
    title: "Performance",
    description: "Goals, reviews, ratings and development plans",
    href: "performance",
    icon: GraduationCap,
  },
  {
    title: "Employment Timeline",
    description: "Promotions, transfers, leave and other HR events",
    href: "timeline",
    icon: Clock3,
  },
];

export default function EmployeeProfilePage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Link
          href="/dashboard/employer/employees"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Employees
        </Link>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-6 py-8 text-white">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold ring-1 ring-white/20">
                  {employee.avatar}
                </div>

                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-bold">{employee.name}</h1>
                    <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                      {employee.status}
                    </span>
                  </div>

                  <p className="text-slate-300">
                    {employee.role} · {employee.department}
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Employee ID: {employee.employeeId} · Record: {id}
                  </p>
                </div>
              </div>

              <button className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100">
                Edit Employee
              </button>
            </div>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                Employee Overview
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <Info
                  icon={BriefcaseBusiness}
                  label="Employment Type"
                  value={employee.employmentType}
                />
                <Info
                  icon={CalendarDays}
                  label="Start Date"
                  value={employee.startDate}
                />
                <Info
                  icon={MapPin}
                  label="Work Location"
                  value={employee.location}
                />
                <Info
                  icon={UserRound}
                  label="Reporting Manager"
                  value={employee.manager}
                />
                <Info
                  icon={Mail}
                  label="Email"
                  value={employee.email}
                />
                <Info
                  icon={Phone}
                  label="Phone"
                  value={employee.phone}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="text-indigo-600" size={20} />
                <h2 className="font-bold text-slate-900">HR Status</h2>
              </div>

              <div className="space-y-4 text-sm">
                <Row label="Employment" value="Active" />
                <Row label="Probation" value="Completed" />
                <Row label="Documents" value="8 / 8 complete" />
                <Row label="Training" value="92% complete" />
                <Row label="Performance" value="On track" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <Link
                key={section.href}
                href={`/dashboard/employer/employees/${id}/${section.href}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon size={21} />
                  </div>

                  <ChevronRight
                    size={18}
                    className="text-slate-400 transition group-hover:translate-x-1"
                  />
                </div>

                <h3 className="mt-4 font-bold text-slate-900">
                  {section.title}
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {section.description}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Metric label="Attendance" value="96.4%" />
          <Metric label="Leave Balance" value="9 days" />
          <Metric label="Training Completion" value="92%" />
        </div>
      </div>
    </main>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <Icon size={15} />
        {label}
      </div>
      <p className="font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 pb-3 last:border-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
