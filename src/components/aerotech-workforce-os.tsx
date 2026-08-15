"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  Banknote,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  FileCheck2,
  FileText,
  GraduationCap,
  Headphones,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  PieChart,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";

type Section =
  | "command"
  | "workforce"
  | "recruitment"
  | "onboarding"
  | "attendance"
  | "performance"
  | "training"
  | "payroll"
  | "wallet"
  | "compliance"
  | "documents"
  | "reports"
  | "settings";

type EmployeeStatus = "Active" | "On Leave" | "Probation";

type Employee = {
  id: number;
  name: string;
  role: string;
  department: string;
  status: EmployeeStatus;
  location: string;
  salary: number;
};

type Training = {
  title: string;
  type: string;
  employees: number;
  completion: number;
  due: string;
};

const employees: Employee[] = [
  {
    id: 1,
    name: "Amina Johnson",
    role: "Operations Manager",
    department: "Operations",
    status: "Active",
    location: "Lagos",
    salary: 480000,
  },
  {
    id: 2,
    name: "Daniel Okafor",
    role: "Software Engineer",
    department: "Technology",
    status: "Active",
    location: "Lagos",
    salary: 650000,
  },
  {
    id: 3,
    name: "Sarah Williams",
    role: "HR Business Partner",
    department: "People",
    status: "On Leave",
    location: "Abuja",
    salary: 520000,
  },
  {
    id: 4,
    name: "Michael Adeyemi",
    role: "Accountant",
    department: "Finance",
    status: "Probation",
    location: "Lagos",
    salary: 390000,
  },
];

const trainingCourses: Training[] = [
  {
    title: "Workplace Safety & PPE",
    type: "Compliance",
    employees: 86,
    completion: 92,
    due: "Aug 22",
  },
  {
    title: "Leadership Development",
    type: "Leadership",
    employees: 24,
    completion: 71,
    due: "Aug 30",
  },
  {
    title: "Cybersecurity Awareness",
    type: "Mandatory",
    employees: 104,
    completion: 84,
    due: "Sep 05",
  },
  {
    title: "Customer Service Excellence",
    type: "Professional",
    employees: 67,
    completion: 63,
    due: "Sep 12",
  },
];

const payrollRows = [
  {
    name: "Amina Johnson",
    gross: 480000,
    paye: 38400,
    pension: 38400,
    net: 403200,
  },
  {
    name: "Daniel Okafor",
    gross: 650000,
    paye: 65000,
    pension: 52000,
    net: 533000,
  },
  {
    name: "Sarah Williams",
    gross: 520000,
    paye: 46800,
    pension: 41600,
    net: 431600,
  },
];

function money(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 shadow-sm">
        <div className="absolute h-6 w-6 rounded-lg border-2 border-white/90" />
        <div className="absolute h-2.5 w-2.5 rounded-full bg-white" />
      </div>

      <div>
        <div className="text-[18px] font-black tracking-tight text-slate-950">
          aerotech
        </div>
        <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Workforce OS
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "Active" || status === "Completed"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/10"
      : status === "On Leave" || status === "Pending"
        ? "bg-amber-50 text-amber-700 ring-amber-600/10"
        : "bg-slate-100 text-slate-600 ring-slate-500/10";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${styles}`}
    >
      {status}
    </span>
  );
}

function StatCard({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string;
  value: string;
  change: string;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
          <Icon size={19} className="text-slate-700" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600">
        <ArrowUpRight size={13} />
        {change}
      </div>
    </div>
  );
}

function AIAssistant({
  onClose,
}: {
  onClose: () => void;
}) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Good morning. I’m Aerotech AI. I can help you understand workforce trends, payroll, attendance, recruitment, compliance and employee performance.",
    },
  ]);

  const ask = () => {
    const value = question.trim();

    if (!value) return;

    setMessages((current) => [
      ...current,
      { role: "user", text: value },
      {
        role: "ai",
        text: "I’ve analysed the request. In the production version, Aerotech AI will use your organisation’s workforce data, policies, payroll rules and country configuration to provide a contextual answer and recommended action.",
      },
    ]);

    setQuestion("");
  };

  return (
    <div className="fixed right-5 top-20 z-50 flex w-[380px] max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between bg-slate-950 px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="text-sm font-bold">Aerotech AI</div>
            <div className="text-[10px] text-slate-400">
              Workforce intelligence
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X size={17} />
        </button>
      </div>

      <div className="max-h-[380px] space-y-3 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={
              message.role === "user"
                ? "ml-8 rounded-xl bg-slate-950 p-3 text-xs leading-5 text-white"
                : "mr-5 rounded-xl bg-slate-100 p-3 text-xs leading-5 text-slate-700"
            }
          >
            {message.text}
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 p-3">
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") ask();
            }}
            placeholder="Ask Aerotech AI..."
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-slate-400"
          />
          <button
            onClick={ask}
            className="rounded-xl bg-slate-950 px-4 text-xs font-bold text-white"
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}

function PageHeader({
  title,
  description,
  action,
  onAction,
}: {
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
          Aerotech Workforce OS
        </div>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {action && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800"
        >
          <Plus size={15} />
          {action}
        </button>
      )}
    </div>
  );
}

function CommandCenter({
  setSection,
  openAI,
}: {
  setSection: (section: Section) => void;
  openAI: () => void;
}) {
  return (
    <>
      <PageHeader
        title="Command Center"
        description="One view of your entire workforce operation."
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-4">
        <StatCard
          label="Total employees"
          value="104"
          change="+8.4% this year"
          icon={Users}
        />
        <StatCard
          label="Present today"
          value="96"
          change="92.3% attendance"
          icon={Clock3}
        />
        <StatCard
          label="Payroll ready"
          value="₦48.6M"
          change="Cycle closes Aug 25"
          icon={Banknote}
        />
        <StatCard
          label="Open positions"
          value="18"
          change="6 urgent roles"
          icon={BriefcaseBusiness}
        />
      </div>

      <div className="mb-6 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-950">Workforce overview</h2>
              <p className="mt-1 text-xs text-slate-500">
                Employee distribution across your organisation.
              </p>
            </div>

            <button
              onClick={() => setSection("workforce")}
              className="text-xs font-bold text-slate-700 hover:text-slate-950"
            >
              View workforce →
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs font-semibold text-slate-500">
                Full time
              </div>
              <div className="mt-2 text-xl font-black">82</div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs font-semibold text-slate-500">
                Contract
              </div>
              <div className="mt-2 text-xl font-black">14</div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs font-semibold text-slate-500">
                Remote
              </div>
              <div className="mt-2 text-xl font-black">8</div>
            </div>
          </div>

          <div className="mt-6 h-32 rounded-xl bg-slate-50 p-4">
            <div className="flex h-full items-end gap-2">
              {[34, 46, 39, 61, 52, 73, 65, 82, 74, 88, 80, 94].map(
                (height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t-md bg-slate-900/80"
                    style={{ height: `${height}%` }}
                  />
                ),
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-950">AI workforce brief</h2>
              <p className="mt-1 text-xs text-slate-500">
                Generated from your workforce signals.
              </p>
            </div>

            <Sparkles size={18} className="text-slate-700" />
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl bg-amber-50 p-4">
              <div className="flex gap-3">
                <AlertCircle size={17} className="mt-0.5 text-amber-600" />
                <div>
                  <div className="text-xs font-bold text-amber-900">
                    Attendance alert
                  </div>
                  <div className="mt-1 text-xs leading-5 text-amber-800">
                    8 employees have attendance exceptions requiring review.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-emerald-50 p-4">
              <div className="flex gap-3">
                <CheckCircle2 size={17} className="mt-0.5 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-emerald-900">
                    Payroll health
                  </div>
                  <div className="mt-1 text-xs leading-5 text-emerald-800">
                    Payroll data is 96% ready for the current cycle.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={openAI}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white"
          >
            <Sparkles size={14} />
            Ask Aerotech AI
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-950">Recent workforce activity</h2>
            <Activity size={18} className="text-slate-400" />
          </div>

          <div className="mt-5 space-y-4">
            {[
              ["New employee onboarded", "Michael Adeyemi", "12 min ago"],
              ["Payroll profile updated", "Amina Johnson", "41 min ago"],
              ["Training completed", "Workplace Safety & PPE", "1 hr ago"],
              ["Candidate moved to interview", "Senior Accountant", "2 hrs ago"],
            ].map(([event, person, time]) => (
              <div
                key={`${event}-${person}`}
                className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                    <Activity size={15} className="text-slate-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {event}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      {person}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-slate-400">
                  {time}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-950">Quick actions</h2>

          <div className="mt-4 grid gap-2">
            {[
              ["Add employee", UserPlus, "workforce"],
              ["Create job", BriefcaseBusiness, "recruitment"],
              ["Run payroll", Banknote, "payroll"],
              ["Create training", GraduationCap, "training"],
              ["Capture attendance", Clock3, "attendance"],
            ].map(([label, Icon, section]) => {
              const ActionIcon = Icon as typeof Users;

              return (
                <button
                  key={label as string}
                  onClick={() => setSection(section as Section)}
                  className="group flex items-center justify-between rounded-xl border border-slate-200 p-3 text-left hover:border-slate-300 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-3">
                    <ActionIcon size={16} className="text-slate-500" />
                    <span className="text-xs font-bold text-slate-700">
                      {label as string}
                    </span>
                  </span>
                  <ArrowRight
                    size={14}
                    className="text-slate-300 group-hover:text-slate-700"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function Workforce() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      employees.filter((employee) =>
        `${employee.name} ${employee.role} ${employee.department}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search],
  );

  return (
    <>
      <PageHeader
        title="Employee 360"
        description="Manage the complete employee lifecycle from one place."
        action="Add employee"
      />

      <div className="mb-5 grid gap-4 md:grid-cols-4">
        <StatCard
          label="Active employees"
          value="96"
          change="+4 this month"
          icon={Users}
        />
        <StatCard
          label="New starters"
          value="8"
          change="This month"
          icon={UserPlus}
        />
        <StatCard
          label="On leave"
          value="5"
          change="Across 3 teams"
          icon={CalendarDays}
        />
        <StatCard
          label="Probation"
          value="7"
          change="2 ending soon"
          icon={Target}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employees..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-xs outline-none focus:border-slate-400 sm:w-72"
            />
          </div>

          <button className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700">
            Export workforce
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Employee", "Department", "Location", "Status", "Salary", ""].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {filtered.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                        {employee.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          {employee.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {employee.role}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-xs text-slate-600">
                    {employee.department}
                  </td>

                  <td className="px-5 py-4 text-xs text-slate-600">
                    {employee.location}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={employee.status} />
                  </td>

                  <td className="px-5 py-4 text-xs font-bold text-slate-700">
                    {money(employee.salary)}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button className="rounded-lg p-2 hover:bg-slate-100">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Recruitment() {
  const jobs = [
    ["Senior Accountant", "Finance", "4 candidates", "Urgent"],
    ["Restaurant Manager", "Operations", "11 candidates", "Open"],
    ["Frontend Engineer", "Technology", "7 candidates", "Open"],
    ["HR Business Partner", "People", "3 candidates", "Screening"],
  ];

  return (
    <>
      <PageHeader
        title="Recruitment"
        description="Move candidates from vacancy to offer without leaving Aerotech."
        action="Create job"
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {jobs.map(([title, department, candidates, status]) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <BriefcaseBusiness size={18} />
              </div>
              <StatusBadge status={status} />
            </div>

            <h3 className="mt-5 text-sm font-black text-slate-900">{title}</h3>
            <p className="mt-1 text-xs text-slate-500">{department}</p>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {candidates}
              </span>
              <button className="text-xs font-bold text-slate-800">
                Open pipeline →
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Onboarding() {
  const stages = [
    ["Offer accepted", 18, "100%"],
    ["Documents", 15, "83%"],
    ["Compliance", 13, "72%"],
    ["Orientation", 11, "61%"],
    ["Fully onboarded", 9, "50%"],
  ];

  return (
    <>
      <PageHeader
        title="Onboarding"
        description="Turn accepted candidates into productive employees."
        action="Start onboarding"
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-950">Onboarding pipeline</h2>

          <div className="mt-6 space-y-5">
            {stages.map(([stage, count, percent]) => (
              <div key={stage}>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="font-bold text-slate-700">{stage}</span>
                  <span className="font-semibold text-slate-400">
                    {count} employees
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-900"
                    style={{ width: percent }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-950">Automated onboarding</h2>

          <div className="mt-5 space-y-3">
            {[
              "Employment contract",
              "Bank details",
              "Tax information",
              "Pension information",
              "Identity documents",
              "Mandatory training",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
              >
                <CheckCircle2 size={17} className="text-emerald-600" />
                <span className="text-xs font-semibold text-slate-700">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Attendance() {
  return (
    <>
      <PageHeader
        title="Attendance"
        description="Capture time, shifts, absence and overtime from one workforce record."
        action="Configure attendance"
      />

      <div className="mb-5 grid gap-4 md:grid-cols-4">
        <StatCard
          label="Present"
          value="96"
          change="92.3%"
          icon={CheckCircle2}
        />
        <StatCard label="Absent" value="3" change="2.9%" icon={AlertCircle} />
        <StatCard label="Late" value="5" change="4.8%" icon={Clock3} />
        <StatCard label="On leave" value="5" change="4.8%" icon={CalendarDays} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-950">Attendance capture</h2>
          <p className="mt-1 text-xs text-slate-500">
            Aerotech supports multiple capture methods.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["Biometric", "Fingerprint / facial device", UserCheck],
              ["Mobile app", "Employee self check-in", Clock3],
              ["Web clock", "Browser-based attendance", Building2],
              ["QR / kiosk", "Shared workplace device", FileCheck2],
              ["Geolocation", "Location-verified check-in", Activity],
              ["API / device", "Integrate existing devices", Settings],
            ].map(([title, description, Icon]) => {
              const CaptureIcon = Icon as typeof Users;

              return (
                <div
                  key={title as string}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <CaptureIcon size={18} className="text-slate-700" />
                  <div className="mt-3 text-xs font-bold text-slate-800">
                    {title as string}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {description as string}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-950">Today's attendance</h2>

          <div className="mt-5 space-y-3">
            {[
              ["Clocked in", "96", "92.3%"],
              ["Pending", "3", "2.9%"],
              ["Late arrivals", "5", "4.8%"],
              ["Overtime", "11", "10.6%"],
            ].map(([label, value, percent]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
              >
                <div className="text-xs font-bold text-slate-700">{label}</div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black">{value}</span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {percent}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Performance() {
  return (
    <>
      <PageHeader
        title="Performance"
        description="Goals, reviews, feedback and workforce performance."
        action="Create review cycle"
      />

      <div className="grid gap-5 md:grid-cols-3">
        {[
          ["Review completion", "87%", "Annual cycle"],
          ["Goals achieved", "74%", "Current period"],
          ["High performers", "19", "Across teams"],
        ].map(([label, value, detail]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="text-xs font-semibold text-slate-500">{label}</div>
            <div className="mt-2 text-3xl font-black">{value}</div>
            <div className="mt-1 text-[11px] text-slate-400">{detail}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-950">Performance framework</h2>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {[
            ["Goals", Target],
            ["Reviews", FileCheck2],
            ["Feedback", MessageSquareText],
            ["Recognition", Award],
          ].map(([label, Icon]) => {
            const PerformanceIcon = Icon as typeof Users;

            return (
              <div
                key={label as string}
                className="rounded-xl bg-slate-50 p-4"
              >
                <PerformanceIcon size={18} />
                <div className="mt-3 text-xs font-bold">
                  {label as string}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function Training() {
  const trainingTypes = [
    "Compliance & statutory",
    "Health & safety",
    "Leadership & management",
    "Technical / job-specific",
    "Soft skills",
    "Professional development",
    "Product training",
    "Customer service",
    "Cybersecurity",
    "Induction / onboarding",
    "Mandatory certification",
    "Continuous learning",
  ];

  return (
    <>
      <PageHeader
        title="Training & L&D"
        description="Manage learning, certification and workforce capability."
        action="Create training"
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-950">Training types</h2>
          <p className="mt-1 text-xs text-slate-500">
            Aerotech supports the full employee learning lifecycle.
          </p>

          <div className="mt-5 grid gap-2">
            {trainingTypes.map((type) => (
              <div
                key={type}
                className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5"
              >
                <GraduationCap size={14} className="text-slate-500" />
                <span className="text-xs font-semibold text-slate-700">
                  {type}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-950">Learning dashboard</h2>
              <p className="mt-1 text-xs text-slate-500">
                Track participation and completion.
              </p>
            </div>
            <GraduationCap size={20} />
          </div>

          <div className="mt-5 space-y-4">
            {trainingCourses.map((course) => (
              <div key={course.title} className="rounded-xl bg-slate-50 p-4">
                <div className="flex justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {course.title}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      {course.type} · {course.employees} employees
                    </div>
                  </div>

                  <span className="text-xs font-black">
                    {course.completion}%
                  </span>
                </div>

                <div className="mt-3 h-2 rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-slate-900"
                    style={{ width: `${course.completion}%` }}
                  />
                </div>

                <div className="mt-2 text-[10px] font-semibold text-slate-400">
                  Due {course.due}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Payroll({
  setSection,
}: {
  setSection: (section: Section) => void;
}) {
  const gross = payrollRows.reduce((sum, row) => sum + row.gross, 0);
  const net = payrollRows.reduce((sum, row) => sum + row.net, 0);
  const paye = payrollRows.reduce((sum, row) => sum + row.paye, 0);
  const pension = payrollRows.reduce((sum, row) => sum + row.pension, 0);

  return (
    <>
      <PageHeader
        title="Payroll"
        description="Gross-to-net payroll with country-aware statutory deductions."
        action="Run payroll"
        onAction={() => setSection("wallet")}
      />

      <div className="mb-5 grid gap-4 md:grid-cols-4">
        <StatCard label="Gross payroll" value={money(gross)} change="Current cycle" icon={Banknote} />
        <StatCard label="PAYE / tax" value={money(paye)} change="Configured by country" icon={FileCheck2} />
        <StatCard label="Pension" value={money(pension)} change="Statutory contribution" icon={ShieldCheck} />
        <StatCard label="Net payroll" value={money(net)} change="Ready for funding" icon={Wallet} />
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-slate-950">
              Multi-country payroll controls
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Country, currency, tax, pension and statutory rules are configured
              at organisation level.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span className="text-[11px] font-bold text-emerald-700">
              Nigeria · NGN · Active
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-bold text-slate-950">Payroll preview</h2>
          <p className="mt-1 text-xs text-slate-500">
            PAYE, pension and employee net pay before final approval.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Employee", "Gross", "PAYE / Tax", "Pension", "Net pay"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {payrollRows.map((row) => (
                <tr key={row.name} className="border-b border-slate-100">
                  <td className="px-5 py-4 text-xs font-bold text-slate-800">
                    {row.name}
                  </td>
                  <td className="px-5 py-4 text-xs">{money(row.gross)}</td>
                  <td className="px-5 py-4 text-xs text-slate-600">
                    {money(row.paye)}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-600">
                    {money(row.pension)}
                  </td>
                  <td className="px-5 py-4 text-xs font-black">
                    {money(row.net)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function PayrollWallet() {
  const [funding, setFunding] = useState(false);

  return (
    <>
      <PageHeader
        title="Payroll Wallet"
        description="Employer-funded payroll balance for controlled salary execution."
        action="Fund wallet"
        onAction={() => setFunding(true)}
      />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400">
                Available payroll balance
              </div>
              <div className="mt-3 text-4xl font-black tracking-tight">
                ₦72,450,000
              </div>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <Wallet size={20} />
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white/10 p-3">
              <div className="text-[10px] text-slate-400">Reserved</div>
              <div className="mt-1 text-sm font-black">₦48.6M</div>
            </div>

            <div className="rounded-xl bg-white/10 p-3">
              <div className="text-[10px] text-slate-400">Available</div>
              <div className="mt-1 text-sm font-black">₦23.8M</div>
            </div>

            <div className="rounded-xl bg-white/10 p-3">
              <div className="text-[10px] text-slate-400">Currency</div>
              <div className="mt-1 text-sm font-black">NGN</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-950">Payroll funding flow</h2>

          <div className="mt-5 space-y-4">
            {[
              ["1", "Employer funds wallet", "Bank / payment provider"],
              ["2", "Payroll is calculated", "Gross → statutory → net"],
              ["3", "Funds are reserved", "Payroll amount locked"],
              ["4", "Payroll is approved", "Authorised by employer"],
              ["5", "Employees are paid", "Payment execution"],
            ].map(([number, title, description]) => (
              <div key={number} className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-[10px] font-black text-white">
                  {number}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {title}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    {description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-bold text-slate-950">Wallet activity</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {[
            ["Payroll reserve", "₦48,600,000", "Reserved", ArrowDownLeft],
            ["Wallet funding", "₦25,000,000", "Received", ArrowUpRight],
            ["Payroll payout", "₦41,250,000", "Completed", ArrowUpRight],
          ].map(([title, amount, status, Icon]) => {
            const WalletIcon = Icon as typeof ArrowUpRight;

            return (
              <div
                key={`${title}-${amount}`}
                className="flex items-center justify-between p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                    <WalletIcon size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold">{title}</div>
                    <div className="mt-0.5 text-[10px] text-slate-400">
                      Today
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black">{amount}</div>
                  <div className="mt-0.5 text-[10px] font-semibold text-emerald-600">
                    {status}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {funding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-5">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-slate-950">Fund payroll wallet</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Add funds for the next payroll cycle.
                </p>
              </div>

              <button onClick={() => setFunding(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="mt-5">
              <label className="text-xs font-bold text-slate-700">
                Funding amount
              </label>
              <div className="mt-2 flex items-center rounded-xl border border-slate-200">
                <span className="px-3 text-sm font-bold">₦</span>
                <input
                  defaultValue="50000000"
                  className="w-full rounded-xl py-3 pr-3 text-sm font-bold outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => setFunding(false)}
              className="mt-5 w-full rounded-xl bg-slate-950 py-3 text-xs font-bold text-white"
            >
              Continue to funding
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Compliance() {
  const controls = [
    ["PAYE / Tax", "Configured", "Nigeria"],
    ["Pension", "Configured", "Nigeria"],
    ["Employment contracts", "98%", "104 employees"],
    ["Required documents", "94%", "Compliance"],
    ["Mandatory training", "92%", "Safety"],
    ["Expiring documents", "7", "Requires action"],
  ];

  return (
    <>
      <PageHeader
        title="Compliance"
        description="Country-aware workforce and statutory compliance controls."
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {controls.map(([title, value, description]) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <ShieldCheck size={19} className="text-slate-700" />
              <StatusBadge status={value === "7" ? "Pending" : "Completed"} />
            </div>

            <div className="mt-5 text-sm font-black text-slate-900">
              {title}
            </div>
            <div className="mt-1 text-xl font-black">{value}</div>
            <div className="mt-1 text-[11px] text-slate-500">{description}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function Documents() {
  return (
    <>
      <PageHeader
        title="Documents"
        description="Centralised employee and organisation document management."
        action="Upload document"
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Employee documents", "438", Users],
          ["Contracts", "104", FileText],
          ["Compliance documents", "87", ShieldCheck],
        ].map(([title, count, Icon]) => {
          const DocumentIcon = Icon as typeof Users;

          return (
            <div
              key={title as string}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <DocumentIcon size={19} />
              <div className="mt-5 text-xs font-bold text-slate-600">
                {title as string}
              </div>
              <div className="mt-2 text-2xl font-black">{count as string}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Reports() {
  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        description="Turn workforce information into management decisions."
      />

      <div className="grid gap-5 md:grid-cols-2">
        {[
          ["Headcount report", "Workforce growth and demographics", Users],
          ["Payroll report", "Gross, deductions and net pay", Banknote],
          ["Attendance report", "Absence, lateness and overtime", Clock3],
          ["Training report", "Completion and certification", GraduationCap],
          ["Recruitment report", "Hiring funnel and time-to-hire", BriefcaseBusiness],
          ["Compliance report", "Statutory and document status", ShieldCheck],
        ].map(([title, description, Icon]) => {
          const ReportIcon = Icon as typeof Users;

          return (
            <div
              key={title as string}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <ReportIcon size={18} />
                </div>
                <ArrowRight size={15} className="text-slate-300" />
              </div>

              <div className="mt-5 text-sm font-black">{title as string}</div>
              <div className="mt-1 text-xs text-slate-500">
                {description as string}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Organisation Settings"
        description="Configure your Aerotech workforce environment."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {[
          ["Organisation", "Company profile, logo, locations and departments"],
          ["Payroll", "Pay cycle, currency, tax and statutory settings"],
          ["Attendance", "Devices, shifts, schedules and attendance rules"],
          ["Training", "Learning catalogue and mandatory courses"],
          ["Compliance", "Country-specific requirements"],
          ["Security", "Roles, permissions, SSO and authentication"],
        ].map(([title, description]) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <Settings size={18} />
              </div>
              <div>
                <div className="text-sm font-black">{title}</div>
                <div className="mt-1 text-xs text-slate-500">{description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function SignInPanel({
  onClose,
}: {
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-5">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <Logo />
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="mt-7">
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-lg py-2 text-xs font-bold ${
                mode === "signin"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Sign in
            </button>

            <button
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-lg py-2 text-xs font-bold ${
                mode === "signup"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Create account
            </button>
          </div>

          <h2 className="mt-6 text-xl font-black text-slate-950">
            {mode === "signin" ? "Welcome back" : "Create your organisation"}
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {mode === "signin"
              ? "Access your Aerotech Workforce OS."
              : "Set up your company and workforce in Aerotech."}
          </p>

          <div className="mt-5 space-y-3">
            {mode === "signup" && (
              <input
                placeholder="Company name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none"
              />
            )}

            <input
              type="email"
              placeholder="Work email"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none"
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none"
            />

            <button
              onClick={onClose}
              className="w-full rounded-xl bg-slate-950 py-3 text-xs font-bold text-white"
            >
              {mode === "signin" ? "Sign in to Aerotech" : "Create Aerotech account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const navigation: Array<{
  id: Section;
  label: string;
  icon: typeof Users;
  group: string;
}> = [
  { id: "command", label: "Command Center", icon: LayoutDashboard, group: "Overview" },
  { id: "workforce", label: "Employees", icon: Users, group: "People" },
  { id: "recruitment", label: "Recruitment", icon: BriefcaseBusiness, group: "People" },
  { id: "onboarding", label: "Onboarding", icon: UserPlus, group: "People" },
  { id: "attendance", label: "Attendance", icon: Clock3, group: "People" },
  { id: "performance", label: "Performance", icon: Target, group: "People" },
  { id: "training", label: "Training & L&D", icon: GraduationCap, group: "People" },
  { id: "payroll", label: "Payroll", icon: Banknote, group: "Finance" },
  { id: "wallet", label: "Payroll Wallet", icon: Wallet, group: "Finance" },
  { id: "compliance", label: "Compliance", icon: ShieldCheck, group: "Control" },
  { id: "documents", label: "Documents", icon: FileText, group: "Control" },
  { id: "reports", label: "Reports", icon: BarChart3, group: "Control" },
  { id: "settings", label: "Settings", icon: Settings, group: "System" },
];

export default function AerotechWorkforceOS() {
  const [section, setSection] = useState<Section>("command");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const title =
    navigation.find((item) => item.id === section)?.label ??
    "Command Center";

  const renderContent = () => {
    switch (section) {
      case "command":
        return <CommandCenter setSection={setSection} openAI={() => setAiOpen(true)} />;
      case "workforce":
        return <Workforce />;
      case "recruitment":
        return <Recruitment />;
      case "onboarding":
        return <Onboarding />;
      case "attendance":
        return <Attendance />;
      case "performance":
        return <Performance />;
      case "training":
        return <Training />;
      case "payroll":
        return <Payroll setSection={setSection} />;
      case "wallet":
        return <PayrollWallet />;
      case "compliance":
        return <Compliance />;
      case "documents":
        return <Documents />;
      case "reports":
        return <Reports />;
      case "settings":
        return <SettingsPage />;
      default:
        return <CommandCenter setSection={setSection} openAI={() => setAiOpen(true)} />;
    }
  };

  const groups = ["Overview", "People", "Finance", "Control", "System"];

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-950">
      <header className="sticky top-0 z-40 flex h-[68px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-xl p-2 hover:bg-slate-100 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <Logo />
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <Building2 size={14} className="text-slate-500" />
            <span className="text-xs font-bold">Acme Group</span>
            <ChevronDown size={13} className="text-slate-400" />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <span className="text-xs">🇳🇬</span>
            <span className="text-xs font-bold">Nigeria · NGN</span>
            <ChevronDown size={13} className="text-slate-400" />
          </div>

          <button
            onClick={() => setAiOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white"
          >
            <Sparkles size={14} />
            AI Assistant
          </button>

          <button className="relative rounded-xl p-2.5 hover:bg-slate-100">
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>

          <button
            onClick={() => setAuthOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white"
          >
            AW
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setAiOpen(true)}
            className="rounded-xl bg-slate-950 p-2 text-white"
          >
            <Sparkles size={16} />
          </button>

          <button
            onClick={() => setAuthOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white"
          >
            AW
          </button>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`fixed left-0 top-[68px] z-30 h-[calc(100vh-68px)] w-[255px] border-r border-slate-200 bg-white transition-transform lg:sticky lg:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full overflow-y-auto p-4">
            <div className="mb-5 rounded-2xl bg-slate-950 p-4 text-white">
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Organisation health
              </div>
              <div className="mt-2 text-2xl font-black">94%</div>
              <div className="mt-1 text-[10px] text-slate-400">
                Workforce operations healthy
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-white/10">
                <div className="h-full w-[94%] rounded-full bg-white" />
              </div>
            </div>

            {groups.map((group) => (
              <div key={group} className="mb-5">
                <div className="px-3 pb-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                  {group}
                </div>

                <div className="space-y-1">
                  {navigation
                    .filter((item) => item.group === group)
                    .map((item) => {
                      const Icon = item.icon;
                      const active = section === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSection(item.id);
                            setMobileOpen(false);
                          }}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                            active
                              ? "bg-slate-950 text-white shadow-sm"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                          }`}
                        >
                          <Icon size={16} />
                          <span className="text-xs font-bold">
                            {item.label}
                          </span>

                          {item.id === "wallet" && (
                            <span
                              className={`ml-auto rounded-full px-1.5 py-0.5 text-[8px] font-black ${
                                active
                                  ? "bg-white/10 text-white"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              FUNDED
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}

            <div className="border-t border-slate-200 pt-4">
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-slate-500 hover:bg-slate-100">
                <LifeBuoy size={16} />
                <span className="text-xs font-bold">Help & Support</span>
              </button>
            </div>
          </div>
        </aside>

        {mobileOpen && (
          <button
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 top-[68px] z-20 bg-slate-950/20 lg:hidden"
          />
        )}

        <main className="min-w-0 flex-1">
          <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
            <div className="mx-auto flex max-w-[1500px] items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-400">
                  Workforce OS
                </span>
                <span className="text-slate-300">/</span>
                <span className="font-bold text-slate-700">{title}</span>
              </div>

              <div className="hidden items-center gap-2 sm:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-500">
                  All systems operational
                </span>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
            {renderContent()}
          </div>
        </main>
      </div>

      <footer className="border-t border-slate-200 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <div className="text-sm font-black">aerotech</div>
            <span className="text-xs text-slate-400">
              Workforce OS
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-[10px] font-semibold text-slate-400">
            <span>AI Workforce Intelligence</span>
            <span>Global Payroll</span>
            <span>Employee 360</span>
            <span>Training & L&D</span>
            <span>Compliance</span>
          </div>
        </div>
      </footer>

      {aiOpen && <AIAssistant onClose={() => setAiOpen(false)} />}

      {authOpen && <SignInPanel onClose={() => setAuthOpen(false)} />}
    </div>
  );
}
