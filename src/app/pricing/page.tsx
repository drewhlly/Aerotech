"use client";

import Link from "next/link";
import { Check, Crown, Sparkles, ShieldCheck } from "lucide-react";
import { useState } from "react";
import {
  EMPLOYER_PLANS,
  type Currency,
  type EmployerPlan,
} from "@/lib/subscriptions";

export default function PricingPage() {
  const [currency, setCurrency] = useState<Currency>("NGN");

  const formatPrice = (amount: number) => {
    if (currency === "NGN") {
      return `₦${amount.toLocaleString("en-NG")}`;
    }

    return `$${amount.toLocaleString("en-US")}`;
  };

  const planIcon = (plan: EmployerPlan) => {
    if (plan === "gold") return <Crown size={22} />;
    if (plan === "silver") return <Sparkles size={22} />;
    return <ShieldCheck size={22} />;
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
            Aerotech
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Choose the plan that fits your organisation
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Powerful recruitment technology designed to help employers hire
            better and help professionals access better opportunities.
          </p>
        </div>

        {/* Currency switcher */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setCurrency("NGN")}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                currency === "NGN"
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              NGN ₦
            </button>

            <button
              type="button"
              onClick={() => setCurrency("USD")}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                currency === "USD"
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              USD $
            </button>
          </div>
        </div>

        {/* Employer plans */}
        <section className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-950">
              Employer plans
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose the level of recruitment power your organisation needs.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {Object.entries(EMPLOYER_PLANS).map(([key, plan]) => {
              const planId = key as EmployerPlan;

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border bg-white p-7 shadow-sm ${
                    planId === "gold"
                      ? "border-slate-950 ring-2 ring-slate-950"
                      : "border-slate-200"
                  }`}
                >
                  {planId === "gold" && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-950 px-4 py-1 text-xs font-bold text-white">
                      MOST POWERFUL
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-slate-950">
                    {planIcon(planId)}

                    <h3 className="text-xl font-bold">{plan.name}</h3>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {plan.description}
                  </p>

                  <div className="mt-6">
                    <div className="text-3xl font-bold text-slate-950">
                      {formatPrice(plan.prices[currency])}
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {plan.period}
                    </p>
                  </div>

                  <div className="my-6 border-t border-slate-200" />

                  <ul className="space-y-3">
                    {plan.features.map((feature: string) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-slate-700"
                      >
                        <Check
                          size={17}
                          className="mt-0.5 shrink-0 text-slate-950"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/pricing/checkout?type=employer&plan=${planId}&currency=${currency}`}
                    className="mt-8 block rounded-xl bg-slate-950 px-5 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Choose {plan.name}
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-950">Employees and applicants join free</h2>
          <p className="mt-3 text-slate-600">Only companies pay for Aerotech subscriptions. Employees are invited by their employers, and applicants can explore job opportunities at no cost.</p>
          <Link href="/jobs" className="mt-6 inline-block rounded-xl bg-slate-950 px-6 py-3.5 font-semibold text-white">Find jobs</Link>
        </section>

        <div className="mt-16 text-center text-sm text-slate-500">
          <p>
            Payment infrastructure will be connected when Aerotech's payment
            provider is ready.
          </p>
        </div>
      </div>
    </main>
  );
}
