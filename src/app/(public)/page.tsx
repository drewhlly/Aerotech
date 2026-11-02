import LandingShowcase from '@/components/landing-showcase';
import Link from "next/link";
import CookieNotice from "@/components/cookie-notice";
import {
  ArrowRight,
  BriefcaseBusiness,
  UserRound,
  Building2,
  Compass,
  FileText,
  Wallet,
  MessageSquareText,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { organisationSchema } from "@/lib/organisation";
export const metadata = pageMetadata(
  "Home",
  "Find your next role, manage your workday and bring your people together. Explore dedicated Aerotech workspaces for applicants, employees and companies.",
  "/",
);
const audiences = [
  {
    label: "For applicants",
    title: "Your next opportunity.",
    text: "Explore roles, upload your CV and follow your application from one place.",
    href: "/careers",
    action: "Explore jobs",
    secondary: "/auth/signup/applicant",
    secondaryLabel: "Create a free account",
    Icon: Compass,
  },
  {
    label: "For employees",
    title: "Your everyday workspace.",
    text: "Your payslips, leave, documents and company updates, ready when you need them.",
    href: "/auth/login?role=employee",
    action: "Employee sign in",
    secondary: "/support",
    secondaryLabel: "Get help with access",
    Icon: UserRound,
  },
  {
    label: "For employers",
    title: "Your people, connected.",
    text: "Bring recruitment, employee records and everyday people operations together.",
    href: "/auth/signup/employer",
    action: "Create a company account",
    secondary: "/solutions",
    secondaryLabel: "Explore company solutions",
    Icon: Building2,
  },
];
export default function Home() {
  return (
    <main className="bg-white text-[#06163F]">
      <CookieNotice/>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organisationSchema).replace(/</g, "\\u003c"),
        }}
      />
      <LandingShowcase/>
      <section
        id="choose-your-path"
        className="mx-auto max-w-7xl scroll-mt-40 px-5 py-20 sm:px-8"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-blue-800">
              A place for you
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.035em]">
              Where would you like to start?
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-slate-600">
            Different roles. Familiar tools.
            <br />
            Your own space to move forward.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {audiences.map(
            (
              {
                label,
                title,
                text,
                href,
                action,
                secondary,
                secondaryLabel,
                Icon,
              },
              i,
            ) => (
              <article
                key={title}
                className={
                  "flex flex-col rounded-2xl border p-6 sm:p-7 " +
                  (i === 2
                    ? "border-[#06163F] bg-[#06163F] text-white"
                    : "border-slate-200 bg-white")
                }
              >
                <Icon
                  size={25}
                  className={i === 2 ? "text-blue-200" : "text-blue-800"}
                />
                <p
                  className={
                    "mt-6 text-xs font-semibold uppercase tracking-wider " +
                    (i === 2 ? "text-blue-100" : "text-slate-600")
                  }
                >
                  {label}
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                  {title}
                </h3>
                <p
                  className={
                    "mb-7 mt-3 text-sm leading-7 " +
                    (i === 2 ? "text-slate-200" : "text-slate-600")
                  }
                >
                  {text}
                </p>
                <Link
                  href={href}
                  className={
                    "aero-button mt-auto justify-between " +
                    (i === 2
                      ? "bg-white text-[#06163F]"
                      : "bg-blue-50 text-blue-900")
                  }
                >
                  {action}
                  <ArrowRight size={17} />
                </Link>
                <Link
                  href={secondary}
                  className={
                    "mt-4 inline-flex min-h-11 items-center justify-center text-xs font-semibold " +
                    (i === 2 ? "text-blue-100" : "text-blue-800")
                  }
                >
                  {secondaryLabel}
                </Link>
              </article>
            ),
          )}
        </div>
      </section>
      <section className="border-y border-slate-200 bg-[#f3f6fc] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-blue-800">
              A more connected working day
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.035em] sm:text-4xl">
              The details matter.
              <br />
              Keep them together.
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-600">
              From a first application to a team’s everyday routine, Aerotech
              keeps people and their next steps connected.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                Icon: BriefcaseBusiness,
                title: "Recruitment",
                text: "Keep vacancies, CVs, assessments and interviews in one hiring journey.",
              },
              {
                Icon: FileText,
                title: "People & documents",
                text: "Organise employee records and share documents with the right people.",
              },
              {
                Icon: Wallet,
                title: "Payroll & workday",
                text: "Follow payroll approvals, payslips, attendance and leave requests.",
              },
              {
                Icon: MessageSquareText,
                title: "Team connection",
                text: "Bring tasks, meetings, learning and feedback into everyday work.",
              },
            ].map(({ Icon, title, text }) => (
              <article key={title} className="aero-card transition-colors hover:border-blue-200">
                <Icon size={22} className="text-blue-800" />
                <h3 className="mt-5 font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
          <p className="mt-5 text-xs leading-6 text-slate-600">
            Services follow your company’s plan and configuration.
            Provider-dependent features are labelled when setup is needed.
          </p>
          <Link
            href="/solutions"
            className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blue-800"
          >
            Discover what you can do <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-blue-800">
            A clear way forward
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-.035em]">
            Start simply.
            <br />
            Build from there.
          </h2>
        </div>
        <ol className="space-y-5">
          {[
            [
              "Choose your path",
              "Create a free applicant account, activate your employee invitation or set up your organisation.",
            ],
            [
              "Make it yours",
              "Add your experience or organise the company records your team needs.",
            ],
            [
              "Keep moving",
              "Follow applications, manage your workday and see what needs your attention.",
            ],
          ].map(([title, text], i) => (
            <li
              key={title}
              className="flex gap-5 border-b border-slate-200 pb-5"
            >
              <span className="text-sm font-semibold text-blue-800">
                0{i + 1}
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="px-5 pb-16 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 rounded-[26px] bg-[#06163F] p-7 text-white sm:p-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-blue-200">
              For growing organisations
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.035em]">
              Make room for better work.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200">
              Choose the company plan that fits your team. Applicants and
              invited employees are not charged.
            </p>
          </div>
          <Link href="/pricing" className="aero-button bg-white text-[#06163F]">
            Compare company plans <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-5 pb-16 sm:px-8">
        <h2 className="text-2xl font-semibold">A few things to know</h2>
        {[
          [
            "Is Aerotech only for employers?",
            "No. Applicants explore opportunities in a free account. Employees use their company workspace, while employers manage their organisation.",
          ],
          [
            "How do employees get access?",
            "Your employer creates your record and sends an activation invitation. Use it to set your password, then select Employee sign in.",
          ],
          [
            "Do applicants pay to apply?",
            "No. Applicant accounts and applications are free. Companies pay for their subscriptions.",
          ],
        ].map(([q, a]) => (
          <details key={q} className="border-b border-slate-200 py-5">
            <summary className="flex min-h-11 cursor-pointer items-center font-semibold">
              {q}
            </summary>
            <p className="mt-3 text-sm leading-7 text-slate-600">{a}</p>
          </details>
        ))}
        <div className="mt-7 flex flex-wrap gap-5 text-sm">
          <Link
            href="/auth/login?role=applicant"
            className="inline-flex min-h-11 items-center font-semibold text-blue-800"
          >
            Applicant sign in →
          </Link>
          <Link
            href="/auth/login?role=employee"
            className="inline-flex min-h-11 items-center font-semibold text-blue-800"
          >
            Employee sign in →
          </Link>
          <Link
            href="/auth/login?role=employer"
            className="inline-flex min-h-11 items-center font-semibold text-blue-800"
          >
            Employer sign in →
          </Link>
        </div>
      </section>
    </main>
  );
}
