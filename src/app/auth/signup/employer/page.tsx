"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/aerotech-portal";

const fields = [
  { name: "companyName", label: "Company name", type: "text", autoComplete: "organization" },
  { name: "companyEmail", label: "Company email", type: "email", autoComplete: "email" },
  { name: "firstName", label: "Admin first name", type: "text", autoComplete: "given-name" },
  { name: "lastName", label: "Admin last name", type: "text", autoComplete: "family-name" },
  { name: "phone", label: "Phone number", type: "tel", autoComplete: "tel" },
  { name: "country", label: "Country", type: "text", autoComplete: "country-name" },
  { name: "password", label: "Password (at least 12 characters)", type: "password", autoComplete: "new-password" },
] as const;

type FieldName = (typeof fields)[number]["name"];
type FormValues = Record<FieldName, string>;

export default function EmployerSignupPage() {
  const [values, setValues] = useState<FormValues>({
    companyName: "", companyEmail: "", firstName: "", lastName: "",
    phone: "", country: "Nigeria", password: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (values.password.length < 12) {
      setError("Please use a password of at least 12 characters.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/auth/signup/employer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          companyName: values.companyName.trim(),
          companyEmail: values.companyEmail.trim().toLowerCase(),
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          phone: values.phone.trim(),
          country: values.country.trim(),
        }),
      });
      const data: { error?: string } = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "We couldn't create your account. Please try again.");
        return;
      }
      window.localStorage.setItem("aerotech_employer_country", values.country.trim());
      window.location.assign("/onboarding/employer");
    } catch {
      setError("Unable to connect to Aerotech right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F8FA]">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <Logo />
        <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <div className="text-sm font-black uppercase tracking-widest text-[#00A896]">Employer setup</div>
          <h1 className="mt-3 text-3xl font-black text-[#102A43] sm:text-4xl">Build your workforce on Aerotech.</h1>
          <p className="mt-3 text-slate-500">Create your company workspace and start managing recruitment, people, training, attendance, payroll and compliance.</p>
          <form onSubmit={submit}>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <label key={field.name} className={field.name === "password" ? "sm:col-span-2" : ""}>
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">{field.label}</span>
                  <input
                    name={field.name}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    required
                    minLength={field.name === "password" ? 12 : undefined}
                    value={values[field.name]}
                    onChange={(event) => setValues((prev) => ({ ...prev, [field.name]: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#00A896] focus:ring-2 focus:ring-[#00A896]/20"
                  />
                </label>
              ))}
            </div>
            <div className="mt-7 rounded-2xl bg-slate-50 p-5">
              <div className="font-black text-[#102A43]">Your Aerotech workspace includes</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {["Recruitment & applicant tracking","Employee 360 workforce management","Attendance & leave","Training & L&D","Payroll & statutory compliance","Payroll wallet & payment workflow","Documents & performance","Aerotech AI"].map((item) => (
                  <div key={item} className="flex gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="shrink-0 text-[#00A896]" size={17} />{item}
                  </div>
                ))}
              </div>
            </div>
            {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">{error}</p>}
            <button type="submit" disabled={busy} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#102A43] px-5 py-4 font-black text-white disabled:opacity-60">
              {busy ? "Creating workspace..." : "Create employer workspace"} <ArrowRight size={18} />
            </button>
          </form>
          <div className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-bold text-[#007F73]">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
