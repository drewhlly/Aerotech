"use client";

import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { saveJob } from "@/lib/jobs";

export default function CreateJobPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    department: "",
    employmentType: "",
    workplace: "",
    location: "",
    experience: "",
    salary: "",
    description: "",
    requirements: "",
  });

  const [error, setError] = useState("");

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Please enter a job title.");
      return;
    }

    if (!form.employmentType) {
      setError("Please select an employment type.");
      return;
    }

    if (!form.workplace) {
      setError("Please select a work arrangement.");
      return;
    }

    if (!form.experience) {
      setError("Please select an experience level.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please provide a job description.");
      return;
    }

    const job = saveJob({
      title: form.title.trim(),
      department: form.department.trim(),
      employmentType: form.employmentType,
      workplace: form.workplace,
      location: form.location.trim(),
      experience: form.experience,
      salary: form.salary.trim(),
      description: form.description.trim(),
      requirements: form.requirements.trim(),
    });

    router.push(
      `/dashboard/employer/jobs/preview?id=${encodeURIComponent(job.id)}`
    );
  }

  function generateDescription() {
    if (!form.title.trim()) {
      setError("Enter a job title first.");
      return;
    }

    setError("");

    const generatedDescription =
      `We are looking for a motivated ${form.title} to join our team. ` +
      `The successful candidate will work collaboratively with key stakeholders, ` +
      `contribute to business objectives, and deliver high-quality results in a ` +
      `professional environment.`;

    updateField("description", generatedDescription);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-10">

        <button
          type="button"
          onClick={() => router.push("/dashboard/employer")}
          className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={18} />
          Back to dashboard
        </button>

        <div className="mb-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-white">
            <BriefcaseBusiness size={27} />
          </div>

          <p className="text-sm font-semibold text-slate-500">
            Recruitment
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Create a new job
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Create a clear job posting that attracts the right candidates
            and gives Aerotech enough information to help you recruit
            intelligently.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10"
        >
          <div className="space-y-8">

            <section>
              <h2 className="text-lg font-semibold">
                Basic information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tell candidates what position you are hiring for.
              </p>

              <div className="mt-6 space-y-6">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Job title
                  </label>

                  <input
                    required
                    value={form.title}
                    onChange={(e) =>
                      updateField("title", e.target.value)
                    }
                    placeholder="e.g. Restaurant Manager"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Department
                    </label>

                    <input
                      value={form.department}
                      onChange={(e) =>
                        updateField("department", e.target.value)
                      }
                      placeholder="e.g. Human Resources"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Employment type
                    </label>

                    <select
                      required
                      value={form.employmentType}
                      onChange={(e) =>
                        updateField(
                          "employmentType",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
                    >
                      <option value="">
                        Select employment type
                      </option>
                      <option value="full-time">
                        Full-time
                      </option>
                      <option value="part-time">
                        Part-time
                      </option>
                      <option value="contract">
                        Contract
                      </option>
                      <option value="internship">
                        Internship
                      </option>
                      <option value="temporary">
                        Temporary
                      </option>
                    </select>
                  </div>

                </div>
              </div>
            </section>

            <div className="border-t border-slate-200" />

            <section>
              <h2 className="text-lg font-semibold">
                Workplace
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Where will this employee work?
              </p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Work arrangement
                  </label>

                  <select
                    required
                    value={form.workplace}
                    onChange={(e) =>
                      updateField("workplace", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
                  >
                    <option value="">
                      Select arrangement
                    </option>
                    <option value="onsite">
                      On-site
                    </option>
                    <option value="hybrid">
                      Hybrid
                    </option>
                    <option value="remote">
                      Remote
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Location
                  </label>

                  <input
                    value={form.location}
                    onChange={(e) =>
                      updateField("location", e.target.value)
                    }
                    placeholder="e.g. Lagos, Nigeria"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>

              </div>
            </section>

            <div className="border-t border-slate-200" />

            <section>
              <h2 className="text-lg font-semibold">
                Candidate profile
              </h2>

              <div className="mt-6 grid gap-6 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Experience level
                  </label>

                  <select
                    required
                    value={form.experience}
                    onChange={(e) =>
                      updateField("experience", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
                  >
                    <option value="">
                      Select experience
                    </option>
                    <option value="entry">
                      Entry level
                    </option>
                    <option value="junior">
                      Junior
                    </option>
                    <option value="mid">
                      Mid-level
                    </option>
                    <option value="senior">
                      Senior
                    </option>
                    <option value="lead">
                      Lead / Manager
                    </option>
                    <option value="executive">
                      Executive
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Salary / compensation
                  </label>

                  <input
                    value={form.salary}
                    onChange={(e) =>
                      updateField("salary", e.target.value)
                    }
                    placeholder="e.g. ₦250,000 - ₦350,000 monthly"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>

              </div>
            </section>

            <div className="border-t border-slate-200" />

            <section>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                <div>
                  <h2 className="text-lg font-semibold">
                    Job description
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Explain the role, responsibilities and expectations.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={generateDescription}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
                >
                  <Sparkles size={17} />
                  Assist with AI
                </button>

              </div>

              <textarea
                required
                rows={8}
                value={form.description}
                onChange={(e) =>
                  updateField("description", e.target.value)
                }
                placeholder="Describe the role and what the successful candidate will be responsible for..."
                className="mt-6 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />
            </section>

            <section>
              <h2 className="text-lg font-semibold">
                Requirements
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                List the skills, qualifications and experience required.
              </p>

              <textarea
                rows={6}
                value={form.requirements}
                onChange={(e) =>
                  updateField("requirements", e.target.value)
                }
                placeholder={"• Bachelor's degree\n• 2+ years relevant experience\n• Strong communication skills"}
                className="mt-6 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />
            </section>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="border-t border-slate-200 pt-6">

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 font-semibold text-white hover:bg-slate-800"
              >
                Preview job
                <ArrowRight size={18} />
              </button>

            </div>

          </div>
        </form>
      </div>
    </main>
  );
}
