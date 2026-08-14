"use client";

import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  FileText,
  CalendarDays,
  UserRoundCog,
  Building2,
  Settings,
  Bell,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function EmployerDashboardPage() {
  const router = useRouter();

  const navigation = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      active: true,
    },
    {
      name: "Jobs",
      icon: BriefcaseBusiness,
    },
    {
      name: "Candidates",
      icon: Users,
    },
    {
      name: "Applications",
      icon: FileText,
    },
    {
      name: "Interviews",
      icon: CalendarDays,
    },
    {
      name: "Employees",
      icon: UserRoundCog,
    },
    {
      name: "Company",
      icon: Building2,
    },
    {
      name: "Settings",
      icon: Settings,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-slate-200 bg-white md:flex md:flex-col">

          <div className="flex h-20 items-center border-b border-slate-200 px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                <BriefcaseBusiness size={21} />
              </div>

              <div>
                <p className="text-lg font-bold">Aerotech</p>
                <p className="text-xs text-slate-500">
                  Employer
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    item.active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold">
                Need help?
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Our team is available to help you get the most from Aerotech.
              </p>

              <button
                type="button"
                className="mt-3 text-xs font-semibold text-slate-900 hover:underline"
              >
                Contact support →
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* Header */}
          <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 md:px-8">

            <div>
              <p className="text-sm text-slate-500">
                Employer workspace
              </p>

              <h1 className="text-lg font-semibold">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-4">

              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <Bell size={18} />

                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-slate-900" />
              </button>

              <div className="hidden items-center gap-3 sm:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  A
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Employer
                  </p>

                  <p className="text-xs text-slate-500">
                    Admin
                  </p>
                </div>
              </div>

            </div>
          </header>

          {/* Content */}
          <section className="flex-1 p-6 md:p-8">

            <div className="mx-auto max-w-7xl">

              {/* Welcome */}
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Welcome back 👋
                  </p>

                  <h2 className="mt-1 text-2xl font-bold tracking-tight">
                    Let's build your team.
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Manage your recruitment process from one intelligent workspace.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/dashboard/employer/jobs/new")}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <Plus size={18} />
                  Create a job
                </button>

              </div>

              {/* Stats */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">
                    Active jobs
                  </p>

                  <div className="mt-3 flex items-end justify-between">
                    <p className="text-3xl font-bold">
                      0
                    </p>

                    <BriefcaseBusiness
                      size={22}
                      className="text-slate-400"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">
                    Total applicants
                  </p>

                  <div className="mt-3 flex items-end justify-between">
                    <p className="text-3xl font-bold">
                      0
                    </p>

                    <Users
                      size={22}
                      className="text-slate-400"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">
                    Shortlisted
                  </p>

                  <div className="mt-3 flex items-end justify-between">
                    <p className="text-3xl font-bold">
                      0
                    </p>

                    <UserRoundCog
                      size={22}
                      className="text-slate-400"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">
                    Interviews
                  </p>

                  <div className="mt-3 flex items-end justify-between">
                    <p className="text-3xl font-bold">
                      0
                    </p>

                    <CalendarDays
                      size={22}
                      className="text-slate-400"
                    />
                  </div>
                </div>

              </div>

              {/* Main cards */}
              <div className="mt-8 grid gap-6 lg:grid-cols-3">

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">
                        Recent applications
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Track your latest candidates.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="flex items-center gap-1 text-sm font-semibold text-slate-900 hover:underline"
                    >
                      View all
                      <ArrowUpRight size={15} />
                    </button>
                  </div>

                  <div className="mt-10 flex flex-col items-center justify-center py-10 text-center">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                      <Users size={24} className="text-slate-500" />
                    </div>

                    <h4 className="mt-4 font-semibold">
                      No applications yet
                    </h4>

                    <p className="mt-1 max-w-sm text-sm text-slate-500">
                      Once candidates apply to your jobs, their applications will appear here.
                    </p>

                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/employer/jobs/new")}
                      className="mt-5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
                    >
                      Create your first job
                    </button>

                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <h3 className="font-semibold">
                    Quick actions
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Get things done faster.
                  </p>

                  <div className="mt-6 space-y-3">

                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/employer/jobs/new")}
                      className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                        <Plus size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          Create a job
                        </p>

                        <p className="text-xs text-slate-500">
                          Start recruiting
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                        <Building2 size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          Complete company profile
                        </p>

                        <p className="text-xs text-slate-500">
                          Improve your workspace
                        </p>
                      </div>
                    </button>

                  </div>
                </div>

              </div>

            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
