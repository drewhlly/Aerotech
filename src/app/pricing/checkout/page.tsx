"use client";

import { useEffect, useMemo, useState } from "react";
import { detectCountry, regionalPrice, displayRegionalPrice } from "@/lib/regional-pricing";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { Suspense } from "react";
import {
  EMPLOYER_PLANS,
  EmployerPlan,
} from "@/lib/subscriptions";

function CheckoutContent() {
  const searchParams = useSearchParams();

  const accountType = searchParams.get("type") || "employer";
  const [country, setCountry] = useState("UNKNOWN");
  useEffect(() => setCountry(detectCountry()), []);
  const selectedPlan = searchParams.get("plan") || "professional";

  const plan = useMemo(() => {
    return (
      EMPLOYER_PLANS[selectedPlan as EmployerPlan] ||
      EMPLOYER_PLANS.professional
    );
  }, [accountType, selectedPlan]);

  const price = regionalPrice(plan, country);
  const formattedPrice = selectedPlan === "enterprise" ? "Contact sales" : displayRegionalPrice(price);
  const isEmployee = accountType === "employee";
  if (isEmployee) {
    return <main className="mx-auto max-w-xl px-5 py-20 text-center"><h1 className="text-2xl font-bold">Employee access is free</h1><p className="mt-4">Only employers pay for subscriptions. Applicants can search for jobs without a payment.</p><Link href="/jobs" className="mt-6 inline-block underline">Browse jobs</Link></main>;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/pricing"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            Back to pricing
          </Link>

          <div className="text-xl font-bold tracking-tight text-slate-900">
            Aerotech
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Secure checkout
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Complete your Aerotech payment
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-slate-500">
            Activate your Aerotech account and unlock the features included
            with your selected plan.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                <CreditCard size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Payment details
                </h2>

                <p className="text-sm text-slate-500">
                  Your payment will be processed securely.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email address
                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Account type
                </label>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 capitalize text-slate-700">
                  {accountType}
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 shrink-0 text-amber-700" size={20} />

                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    Secure payment
                  </p>

                  <p className="mt-1 text-sm text-amber-800">
                    Your payment will be securely processed. Your plan will
                    only be activated after successful payment verification.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-4 font-semibold text-white transition hover:bg-slate-800"
            >
              <CreditCard size={18} />
              Continue to secure payment
            </button>

            <p className="mt-4 text-center text-xs text-slate-400">
              Payment processing will be connected to Aerotech's payment
              infrastructure next.
            </p>
          </section>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              {isEmployee ? "Employee plan" : "Employer plan"}
            </p>

            <h2 className="mt-2 text-2xl font-bold capitalize text-slate-900">
              {plan.name}
            </h2>

            <div className="mt-5 border-b border-slate-200 pb-5">
              <span className="text-3xl font-bold text-slate-900">
                {formattedPrice}
              </span>

              <span className="ml-2 text-sm text-slate-500">
                {isEmployee ? "one-time payment" : "/ month"}
              </span>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-900">
                What's included
              </p>

              <ul className="mt-4 space-y-3">
                {plan.features.map((feature: string) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-slate-600"
                  >
                    <Check
                      size={17}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />

                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-900">
                  {formattedPrice}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="font-semibold text-slate-900">
                  Total
                </span>

                <span className="text-lg font-bold text-slate-900">
                  {formattedPrice}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-500">
            Loading checkout...
          </p>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
