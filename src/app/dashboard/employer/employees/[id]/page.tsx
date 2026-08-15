"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  FileText,
  GraduationCap,
  Landmark,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";

import {
  getEmployee,
  getEmployeeDisplayName,
  getEmployeeGrossSalary,
  getStatutoryReadiness,
} from "@/lib/workforce";

export default function Employee360Page() {
  const params = useParams();
  const employee = getEmployee(String(params.id));

  if (!employee) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold">Employee not found</h1>
          <Link
            href="/dashboard/employer/employees"
            className="mt-4 inline-block text-sm font-semibold underline"
          >
            Back to employees
          </Link>
        </div>
      </main>
    );
  }

  const statutoryReadiness = getStatutoryReadiness(employee);
  const gross = getEmployeeGrossSalary(employee);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-6 py-5">
          <Link
            href="/dashboard/employer/employees"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Employees
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-lg font-bold text-white">
                {employee.firstName[0]}
                {employee.lastName[0]}
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">
                    {getEmployeeDisplayName(employee)}
                  </h1>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    {employee.employmentStatus}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {employee.jobTitle} · {employee.department} ·{" "}
                  {employee.employeeNumber}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/dashboard/employer/employees/${employee.id}/documents`}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold"
              >
                Documents
              </Link>

              <Link
                href={`/dashboard/employer/employees/${employee.id}/compensation`}
                className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Compensation
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] px-6 py-7">
        <div className="grid gap-4 md:grid-cols-4">
          <Metric
            icon={<Banknote className="h-5 w-5" />}
            label="Gross pay"
            value={`${employee.compensation.currency} ${gross.toLocaleString()}`}
          />

          <Metric
            icon={<Landmark className="h-5 w-5" />}
            label="Country"
            value={employee.country}
          />

          <Metric
            icon={<CalendarDays className="h-5 w-5" />}
            label="Joined"
            value={employee.hireDate}
          />

          <Metric
            icon={<ShieldCheck className="h-5 w-5" />}
            label="Statutory readiness"
            value={`${statutoryReadiness}%`}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <div className="space-y-6">
            <Card title="Employee information" icon={<UserRound />}>
              <InfoGrid
                items={[
                  ["Full name", getEmployeeDisplayName(employee)],
                  ["Email", employee.email],
                  ["Phone", employee.phone || "Not provided"],
                  ["Nationality", employee.nationality || "Not provided"],
                  ["Work location", employee.workLocation || "Not assigned"],
                  ["Employment type", employee.employmentType],
                ]}
              />
            </Card>

            <Card title="Employment" icon={<BriefcaseBusiness />}>
              <InfoGrid
                items={[
                  ["Job title", employee.jobTitle],
                  ["Department", employee.department],
                  ["Employee number", employee.employeeNumber],
                  ["Hire date", employee.hireDate],
                  [
                    "Probation",
                    employee.probationEndDate || "Not applicable",
                  ],
                  ["Employment status", employee.employmentStatus],
                ]}
              />
            </Card>

            <Card title="Payroll & statutory profile" icon={<WalletCards />}>
              <div className="grid gap-4 md:grid-cols-3">
                <StatutoryCard
                  title="Tax / Payee"
                  status={employee.taxProfile.status}
                  detail={
                    employee.taxProfile.taxIdentificationNumber ||
                    "Tax profile pending"
                  }
                />

                <StatutoryCard
                  title="Pension"
                  status={employee.pensionProfile.status}
                  detail={
                    employee.pensionProfile.pensionProvider ||
                    "Pension provider pending"
                  }
                />

                <StatutoryCard
                  title="Social security"
                  status={employee.socialSecurityProfile.status}
                  detail={
                    employee.socialSecurityProfile.scheme ||
                    "Country rules pending"
                  }
                />
              </div>
            </Card>

            <Card title="Compensation" icon={<Banknote />}>
              <InfoGrid
                items={[
                  [
                    "Base salary",
                    `${employee.compensation.currency} ${employee.compensation.baseSalary.toLocaleString()}`,
                  ],
                  [
                    "Allowances",
                    `${employee.compensation.currency} ${(
                      gross - employee.compensation.baseSalary
                    ).toLocaleString()}`,
                  ],
                  ["Pay frequency", employee.compensation.payFrequency],
                  ["Effective from", employee.compensation.effectiveFrom],
                  ["Currency", employee.compensation.currency],
                  ["Gross pay", `${employee.compensation.currency} ${gross.toLocaleString()}`],
                ]}
              />
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Workforce actions" icon={<GraduationCap />}>
              <div className="grid gap-2">
                <Action href={`/dashboard/employer/employees/${employee.id}/performance`} label="Performance" />
                <Action href={`/dashboard/employer/employees/${employee.id}/documents`} label="Documents" />
                <Action href={`/dashboard/employer/employees/${employee.id}/compensation`} label="Compensation" />
                <Action href={`/dashboard/employer/employees/${employee.id}/timeline`} label="Employee timeline" />
                <Action href="/dashboard/employer/training" label="Training & L&D" />
                <Action href="/dashboard/employer/attendance/leave" label="Leave & absence" />
              </div>
            </Card>

            <Card title="Compliance status" icon={<ShieldCheck />}>
              <div className="space-y-4">
                <Progress
                  label="Tax / Payee"
                  value={employee.taxProfile.status === "configured" ? 100 : 50}
                />

                <Progress
                  label="Pension"
                  value={
                    employee.pensionProfile.status === "configured" ? 100 : 50
                  }
                />

                <Progress
                  label="Social security"
                  value={
                    employee.socialSecurityProfile.status === "configured"
                      ? 100
                      : 50
                  }
                />

                <div className="rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
                  Aerotech applies statutory payroll rules according to the
                  employee&apos;s employing country and configured payroll
                  jurisdiction. Rules are versioned so employers can review
                  the effective period used for each payroll run.
                </div>
              </div>
            </Card>

            <Card title="Recent activity" icon={<FileText />}>
              <div className="space-y-4">
                {employee.timeline.map((event) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="mt-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">{event.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {event.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 text-slate-400">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="mt-3 text-xl font-bold">{value}</p>
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="text-slate-500">{icon}</div>
        <h2 className="font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function InfoGrid({
  items,
}: {
  items: Array<[string, string]>;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

function StatutoryCard({
  title,
  status,
  detail,
}: {
  title: string;
  status: string;
  detail: string;
}) {
  const ready = status === "configured";

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold">{title}</p>

        <span
          className={`rounded-full px-2 py-1 text-[10px] font-bold ${
            ready
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {ready ? "READY" : "REVIEW"}
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}

function Progress({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs font-semibold">
        <span>{label}</span>
        <span>{value}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-900"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function Action({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50"
    >
      {label}
      <ArrowLeft className="h-4 w-4 rotate-180 text-slate-400" />
    </Link>
  );
}
