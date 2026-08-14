"use client";

import { Building2, UserRound, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <div className="text-3xl font-bold text-slate-900">Aerotech</div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900">
            Create your Aerotech account
          </h1>
          <p className="mt-3 text-slate-600">
            Choose how you want to use Aerotech.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <button
            onClick={() => router.push("/auth/signup/employer")}
            className="group rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Building2 size={28} />
            </div>

            <h2 className="mt-6 text-2xl font-semibold text-slate-900">
              I&apos;m an Employer
            </h2>

            <p className="mt-3 text-slate-600">
              Create your company, build your workforce, manage employees,
              recruitment, operations and HR from one platform.
            </p>

            <div className="mt-6 flex items-center font-semibold text-slate-900">
              Create employer account
              <ArrowRight
                size={18}
                className="ml-2 transition-transform group-hover:translate-x-1"
              />
            </div>
          </button>

          <button
            onClick={() => router.push("/auth/signup/employee")}
            className="group rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
              <UserRound size={28} />
            </div>

            <h2 className="mt-6 text-2xl font-semibold text-slate-900">
              I&apos;m an Employee
            </h2>

            <p className="mt-3 text-slate-600">
              Create your employee profile, discover opportunities, manage
              your career and connect with employers.
            </p>

            <div className="mt-6 flex items-center font-semibold text-slate-900">
              Create employee account
              <ArrowRight
                size={18}
                className="ml-2 transition-transform group-hover:translate-x-1"
              />
            </div>
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/auth/login")}
            className="font-semibold text-slate-900 hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </main>
  );
}
