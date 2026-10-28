export const AEROTECH = {
  name: "AEROTECH",
  tagline: "People. Performance. Progress.",
  description:
    "The intelligent workforce operating system for employers, employees and modern teams.",
  colors: {
    cyan: "#00D4FF",
    blue: "#6366F1",
    purple: "#9D4EDD",
    navy: "#0F172A",
    white: "#F8FAFC",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    neutral: "#64748B",
  },
} as const;

export type CountryCode = "NG" | "GH" | "KE" | "ZA" | "GB" | "US";

export type QuickAction = {
  id: string;
  label: string;
  description: string;
  href: string;
  type: "employee" | "job" | "payroll" | "training" | "attendance" | "ai";
};

export type PayrollSummary = {
  gross: number;
  employeeTax: number;
  pension: number;
  otherDeductions: number;
  employerContributions: number;
  net: number;
  status: "draft" | "ready" | "processing" | "paid";
};

export const employerOSData = {
  company: {
    name: "Aerotech Demo Company",
    country: "Nigeria",
    countryCode: "NG" as CountryCode,
    currency: "NGN",
    employees: 248,
    locations: 6,
  },

  overview: {
    totalEmployees: 248,
    activeEmployees: 231,
    newHires: 12,
    openJobs: 8,
    attendanceRate: 96,
    trainingCompletion: 78,
    pendingApprovals: 7,
    payrollReadiness: 94,
  },

  payroll: {
    currentPeriod: "August 2026",
    nextPayrollDate: "31 August 2026",
    walletBalance: 18500000,
    payrollRequired: 12750000,
    gross: 15200000,
    employeeTax: 1430000,
    pension: 760000,
    otherDeductions: 110000,
    employerContributions: 1050000,
    net: 12950000,
    status: "ready" as const,
  },

  quickActions: [
    {
      id: "add-employee",
      label: "Add employee",
      description: "Create a new employee record",
      href: "/dashboard/employer/employees",
      type: "employee",
    },
    {
      id: "create-job",
      label: "Create job",
      description: "Open a recruitment requisition",
      href: "/dashboard/employer/recruitment/jobs/new",
      type: "job",
    },
    {
      id: "run-payroll",
      label: "Run payroll",
      description: "Review and process payroll",
      href: "/dashboard/employer/payroll/run",
      type: "payroll",
    },
    {
      id: "training",
      label: "Create training",
      description: "Set up employee development",
      href: "/dashboard/employer/training/new",
      type: "training",
    },
    {
      id: "attendance",
      label: "Review attendance",
      description: "Monitor attendance and shifts",
      href: "/dashboard/employer/attendance",
      type: "attendance",
    },
    {
      id: "ai",
      label: "Ask Aerotech AI",
      description: "Get workforce insights",
      href: "/dashboard/employer/ai",
      type: "ai",
    },
  ] satisfies QuickAction[],

  activities: [
    {
      title: "Payroll is ready for review",
      description: "August payroll has passed the current validation checks.",
      time: "12 minutes ago",
      type: "payroll",
    },
    {
      title: "12 employees completed training",
      description: "Leadership & Workplace Ethics training completed.",
      time: "1 hour ago",
      type: "training",
    },
    {
      title: "Attendance anomaly detected",
      description: "Aerotech AI identified unusual absence patterns.",
      time: "2 hours ago",
      type: "ai",
    },
    {
      title: "New recruitment application",
      description: "A candidate applied for Product Manager.",
      time: "3 hours ago",
      type: "recruitment",
    },
  ],

  workforce: [
    {
      id: "EMP-00045",
      name: "David Okafor",
      position: "Product Manager",
      department: "Engineering",
      status: "Active",
      attendance: 96,
      training: 78,
      performance: 4.2,
      location: "Lagos HQ",
    },
    {
      id: "EMP-00046",
      name: "Grace Johnson",
      position: "HR Business Partner",
      department: "People",
      status: "Active",
      attendance: 98,
      training: 91,
      performance: 4.6,
      location: "Lagos HQ",
    },
    {
      id: "EMP-00047",
      name: "Michael Adeyemi",
      position: "Operations Manager",
      department: "Operations",
      status: "On Leave",
      attendance: 93,
      training: 72,
      performance: 4.0,
      location: "Abuja",
    },
    {
      id: "EMP-00048",
      name: "Sarah Williams",
      position: "Finance Analyst",
      department: "Finance",
      status: "Active",
      attendance: 97,
      training: 84,
      performance: 4.4,
      location: "Lagos HQ",
    },
  ],

  trainingTypes: [
    {
      name: "Instructor-led training",
      description: "Classroom or live virtual instructor sessions.",
      icon: "presentation",
    },
    {
      name: "E-learning",
      description: "Self-paced online courses and learning paths.",
      icon: "monitor",
    },
    {
      name: "On-the-job training",
      description: "Practical learning under an assigned supervisor.",
      icon: "briefcase",
    },
    {
      name: "Compliance training",
      description: "Mandatory policy, safety and regulatory training.",
      icon: "shield",
    },
    {
      name: "Certification",
      description: "External or internal certification programmes.",
      icon: "award",
    },
    {
      name: "Workshop",
      description: "Interactive skill-building workshops.",
      icon: "users",
    },
    {
      name: "Coaching",
      description: "Structured one-to-one employee development.",
      icon: "message",
    },
    {
      name: "Mentorship",
      description: "Long-term guided career development.",
      icon: "heart",
    },
  ],

  attendanceMethods: [
    {
      name: "Web clock-in/out",
      description: "Employees clock in from the Aerotech employee portal.",
      status: "Available",
    },
    {
      name: "Mobile attendance",
      description: "Mobile check-in and check-out from approved devices.",
      status: "Available",
    },
    {
      name: "QR attendance",
      description: "Location-based QR attendance for workplaces and events.",
      status: "Available",
    },
    {
      name: "GPS / Geofencing",
      description: "Restrict attendance to approved work locations.",
      status: "Configurable",
    },
    {
      name: "Biometric integration",
      description: "Connect supported biometric attendance devices.",
      status: "Integration",
    },
    {
      name: "Admin correction",
      description: "Authorized managers can correct attendance with an audit trail.",
      status: "Available",
    },
    {
      name: "Shift attendance",
      description: "Automatically compare attendance against assigned shifts.",
      status: "Available",
    },
  ],

  ai: {
    name: "Aerotech AI",
    capabilities: [
      "Workforce analytics",
      "Payroll anomaly detection",
      "Attendance insights",
      "Recruitment assistance",
      "Job description generation",
      "Training recommendations",
      "Performance summaries",
      "Compliance reminders",
      "Natural-language HR reporting",
    ],
  },

  compliance: {
    country: "Nigeria",
    items: [
      {
        name: "PAYE / Employee Tax",
        category: "Employee deduction",
        status: "Configured",
      },
      {
        name: "Pension",
        category: "Employee + employer contribution",
        status: "Configured",
      },
      {
        name: "Other statutory deductions",
        category: "Country dependent",
        status: "Configurable",
      },
      {
        name: "Employer contributions",
        category: "Employer cost",
        status: "Configured",
      },
      {
        name: "Payroll audit trail",
        category: "Control",
        status: "Active",
      },
    ],
  },
};

export function formatMoney(
  amount: number,
  currency = "NGN",
  locale = "en-NG"
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getPayrollStatusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: "Draft",
    ready: "Ready",
    processing: "Processing",
    paid: "Paid",
  };

  return labels[status] ?? status;
}

export function getPayrollStatusClass(status: string) {
  const classes: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    ready: "bg-emerald-50 text-emerald-700",
    processing: "bg-blue-50 text-blue-700",
    paid: "bg-violet-50 text-violet-700",
  };

  return classes[status] ?? "bg-slate-100 text-slate-700";
}

export function getAiResponse(prompt: string) {
  const text = prompt.toLowerCase();

  if (text.includes("payroll")) {
    return "Payroll is currently 94% ready. The August payroll requirement is ₦12.75m and the employer wallet has ₦18.5m available in this demo environment. Before approval, review PAYE, pension, other deductions and employer contributions.";
  }

  if (text.includes("attendance")) {
    return "Attendance is currently 96%. Aerotech supports web clock-in/out, mobile attendance, QR, GPS/geofencing, biometric integrations, admin corrections and shift-based attendance.";
  }

  if (text.includes("training")) {
    return "Training completion is 78%. Recommended next steps are compliance training for employees with overdue requirements and targeted leadership training for managers.";
  }

  if (text.includes("employee")) {
    return "There are 248 employees, with 231 currently active. I can help identify attendance issues, training gaps, performance trends or workforce movements.";
  }

  if (text.includes("compliance")) {
    return "The current Nigeria payroll configuration tracks PAYE, pension, employer contributions, other statutory deductions and payroll audit controls. Country-specific rules should be validated and versioned before production payroll.";
  }

  if (
    text.includes("recruit") ||
    text.includes("candidate") ||
    text.includes("job")
  ) {
    return "Aerotech recruitment can track requisitions, candidates, assessments, interviews, offers and onboarding. I can also help draft a job description or summarize candidate pipelines.";
  }

  return "I can help with payroll, attendance, recruitment, training, employees, performance and compliance. Ask me a workforce question in plain English.";
}

export type PaymentProvider = "paystack" | "flutterwave" | "manual";

export const paymentConfig = {
  mode: "demo" as "demo" | "production",
  provider: "paystack" as PaymentProvider,
  currency: "NGN",
  note: "Production API keys, webhooks and bank payout credentials are intentionally not included.",
};

export type WalletTransaction = {
  id: string;
  date: string;
  type: "credit" | "debit";
  description: string;
  reference: string;
  amount: number;
  status: "successful" | "pending" | "failed";
};

export const walletTransactions: WalletTransaction[] = [
  {
    id: "TXN-1001",
    date: "12 Aug 2026",
    type: "credit",
    description: "Payroll wallet funding",
    reference: "AERO-WALLET-1001",
    amount: 10000000,
    status: "successful",
  },
  {
    id: "TXN-1002",
    date: "08 Aug 2026",
    type: "credit",
    description: "Payroll wallet funding",
    reference: "AERO-WALLET-1002",
    amount: 8500000,
    status: "successful",
  },
  {
    id: "TXN-1003",
    date: "31 Jul 2026",
    type: "debit",
    description: "July payroll settlement",
    reference: "AERO-PAYROLL-0726",
    amount: 11800000,
    status: "successful",
  },
];

export const payrollCalculationExample = {
  gross: 15200000,
  employeeTax: 1430000,
  pension: 760000,
  otherDeductions: 110000,
  employerContributions: 1050000,
  netPay: 12950000,
};
