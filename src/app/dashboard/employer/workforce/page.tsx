"use client";

import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  Users,
  UserPlus,
  WalletCards,
  AlertTriangle,
} from "lucide-react";

import {
  DEMO_EMPLOYEES,
  WORKFORCE_SUMMARY,
  formatCurrency,
} from "@/lib/employer-os";

const navItems = [
  {
    label: "Overview",
    href: "/dashboard/employer",
    icon: LayoutDashboard,
  },
  {
    label: "People",
    href: "/dashboard/employer/employees",
    icon: Users,
  },
  {
    label: "Recruitment",
    href: "/dashboard/employer/recruitment",
    icon: UserPlus,
  },
  {
    label: "Payroll",
    href: "/dashboard/employer/payroll",
    icon: WalletCards,
  },
  {
    label: "Training",
    href: "/dashboard/employer/training",
    icon: GraduationCap,
  },
  {
    label: "Compliance",
    href: "/dashboard/employer/compliance",
    icon: ShieldCheck,
  },
];

const stats = [
  {
    label: "Total workforce",
    value: WORKFORCE_SUMMARY.totalEmployees,
    sub: `${WORKFORCE_SUMMARY.activeEmployees} active`,
    icon: Users,
  },
  {
    label: "Open positions",
    value: WORKFORCE_SUMMARY.openJobs,
    sub: "Across all departments",
    icon: BriefcaseBusiness,
  },
  {
    label: "Payroll status",
    value: "Ready",
    sub: "Next run awaiting approval",
    icon: CircleDollarSign,
  },
  {
    label: "Compliance",
    value: WORKFORCE_SUMMARY.complianceIssues,
    sub: "Items need attention",
    icon: ShieldCheck,
  },
];

export default function WorkforcePage() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-[250px] shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="flex h-16 items-center border-b border-slate-200 px-6">
            <div>
              <div className="text-xl font-bold tracking-tight">
                aerotech
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Workforce OS
              </div>
            </div>
          </div>

          <div className="px-4 py-5">
            <div className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Employer
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      item.label === "People"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="absolute bottom-0 hidden w-[250px] border-t border-slate-200 bg-white p-4 lg:block">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs font-semibold">
                Acme Corporation
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Multi-country workforce
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
            <div>
              <h1 className="text-lg font-semibold">
                Workforce
              </h1>
              <p className="text-xs text-slate-500">
                Employee 360 and workforce operations
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium sm:flex">
                All countries
                <ChevronDown size={14} />
              </button>

              <button className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
                Add employee
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] space-y-6 p-5 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-medium text-slate-500">
                          {stat.label}
                        </div>

                        <div className="mt-2 text-2xl font-bold">
                          {stat.value}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          {stat.sub}
                        </div>
                      </div>

                      <div className="rounded-xl bg-slate-100 p-2.5">
                        <Icon size={18} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <div>
                    <h2 className="font-semibold">
                      People
                    </h2>
                    <p className="text-xs text-slate-500">
                      Your workforce at a glance
                    </p>
                  </div>

                  <Link
                    href="/dashboard/employer/employees"
                    className="flex items-center gap-1 text-xs font-semibold"
                  >
                    View all
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  {DEMO_EMPLOYEES.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between gap-4 px-5 py-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">
                          {employee.firstName[0]}
                          {employee.lastName[0]}
                        </div>

                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">
                            {employee.firstName}{" "}
                            {employee.lastName}
                          </div>

                          <div className="truncate text-xs text-slate-500">
                            {employee.jobTitle} ·{" "}
                            {employee.department}
                          </div>
                        </div>
                      </div>

                      <div className="hidden text-right sm:block">
                        <div className="text-xs font-medium">
                          {employee.location},{" "}
                          {employee.countryCode}
                        </div>

                        <div className="mt-1 text-[11px] text-slate-400">
                          {employee.employmentStatus}
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          employee.complianceStatus ===
                          "compliant"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {employee.complianceStatus ===
                        "compliant"
                          ? "Compliant"
                          : "Attention"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">
                      Workforce health
                    </h2>

                    <p className="text-xs text-slate-500">
                      Operational indicators
                    </p>
                  </div>

                  <Building2 size={18} />
                </div>

                <div className="mt-6 space-y-5">
                  <HealthRow
                    label="Active workforce"
                    value="94%"
                    icon={<CheckCircle2 size={17} />}
                  />

                  <HealthRow
                    label="Training completion"
                    value="87%"
                    icon={<GraduationCap size={17} />}
                  />

                  <HealthRow
                    label="Payroll readiness"
                    value="100%"
                    icon={<WalletCards size={17} />}
                  />

                  <HealthRow
                    label="Compliance coverage"
                    value="91%"
                    icon={<ShieldCheck size={17} />}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <ActionCard
                title="Payroll"
                description="Run payroll, review PAYE, pension and employer contributions."
                href="/dashboard/employer/payroll"
                icon={<WalletCards size={20} />}
              />

              <ActionCard
                title="Recruitment"
                description="Manage jobs, candidates, interviews and offers."
                href="/dashboard/employer/recruitment"
                icon={<UserPlus size={20} />}
              />

              <ActionCard
                title="Compliance"
                description="Monitor statutory requirements, expiries and employee records."
                href="/dashboard/employer/compliance"
                icon={<ShieldCheck size={20} />}
              />
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={19} />

                <div>
                  <div className="text-sm font-semibold text-amber-900">
                    6 compliance items require attention
                  </div>

                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    Aerotech has identified employee statutory or
                    documentation items that should be reviewed before
                    the next payroll cycle.
                  </p>

                  <Link
                    href="/dashboard/employer/compliance"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-900"
                  >
                    Review compliance
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <Clock3 size={18} />
                  <div>
                    <h3 className="font-semibold">
                      Pending onboarding
                    </h3>

                    <p className="text-xs text-slate-500">
                      {WORKFORCE_SUMMARY.pendingOnboarding} employees
                      require onboarding actions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <GraduationCap size={18} />
                  <div>
                    <h3 className="font-semibold">
                      Training due
                    </h3>

                    <p className="text-xs text-slate-500">
                      {WORKFORCE_SUMMARY.trainingDue} employees have
                      outstanding learning requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <footer className="border-t border-slate-200 pt-5 text-[11px] text-slate-400">
              Aerotech Workforce OS · Employee lifecycle · Payroll ·
              Compliance · Recruitment · Training
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}

function HealthRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium">
          {icon}
          {label}
        </div>

        <span className="text-xs font-bold">{value}</span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-900"
          style={{
            width: value,
          }}
        />
      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="rounded-xl bg-slate-100 p-2.5">
          {icon}
        </div>

        <ArrowRight
          size={17}
          className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-900"
        />
      </div>

      <h3 className="mt-5 font-semibold">{title}</h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </Link>
  );
}
