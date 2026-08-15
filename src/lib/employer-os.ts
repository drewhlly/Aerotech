/**
 * Aerotech Employer Operating System
 *
 * Unified employer command-center domain.
 *
 * This layer intentionally keeps statutory payroll rules separate
 * from the dashboard. Country-specific rules belong in the
 * payroll-compliance engine and must be versioned by jurisdiction
 * and effective date.
 */

export type WorkforceStatus =
  | "active"
  | "on_leave"
  | "probation"
  | "notice"
  | "terminated";

export type AlertSeverity = "critical" | "warning" | "info" | "success";

export type PayrollCountry =
  | "NG"
  | "GH"
  | "KE"
  | "ZA"
  | "GB"
  | "US";

export interface WorkforceSnapshot {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  probation: number;
  newHires: number;
  openPositions: number;
  attendanceRate: number;
  turnoverRate: number;
}

export interface PayrollSnapshot {
  payrollPeriod: string;
  grossPayroll: number;
  employeeDeductions: number;
  employerContributions: number;
  netPayroll: number;
  employeesProcessed: number;
  employeesPending: number;
  status: "draft" | "processing" | "approved" | "paid";
  country: PayrollCountry;
}

export interface RecruitmentSnapshot {
  openJobs: number;
  applicants: number;
  screening: number;
  interviews: number;
  offers: number;
  hired: number;
}

export interface ComplianceSnapshot {
  compliant: number;
  expiring: number;
  expired: number;
  missing: number;
  complianceRate: number;
}

export interface TrainingSnapshot {
  activeCourses: number;
  enrolledEmployees: number;
  completedCourses: number;
  overdueTraining: number;
  completionRate: number;
}

export interface EmployerAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  timestamp: string;
  action?: string;
  href?: string;
}

export interface EmployerQuickAction {
  label: string;
  description: string;
  href: string;
  icon:
    | "employee"
    | "job"
    | "payroll"
    | "training"
    | "document"
    | "report";
}

export interface EmployerOSData {
  companyName: string;
  country: PayrollCountry;
  currency: string;
  workforce: WorkforceSnapshot;
  payroll: PayrollSnapshot;
  recruitment: RecruitmentSnapshot;
  compliance: ComplianceSnapshot;
  training: TrainingSnapshot;
  alerts: EmployerAlert[];
  quickActions: EmployerQuickAction[];
}

export const employerOSData: EmployerOSData = {
  companyName: "Aerotech Demo Company",
  country: "NG",
  currency: "NGN",

  workforce: {
    totalEmployees: 248,
    activeEmployees: 231,
    onLeave: 9,
    probation: 8,
    newHires: 14,
    openPositions: 12,
    attendanceRate: 96.4,
    turnoverRate: 3.8,
  },

  payroll: {
    payrollPeriod: "August 2026",
    grossPayroll: 58420000,
    employeeDeductions: 7210000,
    employerContributions: 3840000,
    netPayroll: 51210000,
    employeesProcessed: 226,
    employeesPending: 5,
    status: "processing",
    country: "NG",
  },

  recruitment: {
    openJobs: 12,
    applicants: 386,
    screening: 64,
    interviews: 27,
    offers: 8,
    hired: 14,
  },

  compliance: {
    compliant: 219,
    expiring: 11,
    expired: 7,
    missing: 11,
    complianceRate: 88.3,
  },

  training: {
    activeCourses: 18,
    enrolledEmployees: 164,
    completedCourses: 121,
    overdueTraining: 13,
    completionRate: 73.8,
  },

  alerts: [
    {
      id: "payroll-001",
      title: "Payroll requires attention",
      description:
        "5 employees are still pending payroll validation for the current period.",
      severity: "warning",
      timestamp: "Today",
      action: "Review payroll",
      href: "/dashboard/employer/payroll",
    },
    {
      id: "compliance-001",
      title: "Documents approaching expiry",
      description:
        "11 employee compliance documents require renewal within the configured period.",
      severity: "warning",
      timestamp: "Today",
      action: "Review documents",
      href: "/dashboard/employer/compliance/expiring",
    },
    {
      id: "training-001",
      title: "Overdue mandatory training",
      description:
        "13 employees have overdue mandatory learning assignments.",
      severity: "critical",
      timestamp: "Yesterday",
      action: "Open training",
      href: "/dashboard/employer/training",
    },
    {
      id: "recruitment-001",
      title: "Recruitment pipeline is active",
      description:
        "27 candidates are currently scheduled or ready for interviews.",
      severity: "info",
      timestamp: "Yesterday",
      action: "View recruitment",
      href: "/dashboard/employer/recruitment",
    },
  ],

  quickActions: [
    {
      label: "Add employee",
      description: "Create a new employee profile",
      href: "/dashboard/employer/employees",
      icon: "employee",
    },
    {
      label: "Create job",
      description: "Open a new recruitment position",
      href: "/dashboard/employer/recruitment/jobs/new",
      icon: "job",
    },
    {
      label: "Run payroll",
      description: "Process the current payroll period",
      href: "/dashboard/employer/payroll/run",
      icon: "payroll",
    },
    {
      label: "Assign training",
      description: "Create a learning assignment",
      href: "/dashboard/employer/training/new",
      icon: "training",
    },
    {
      label: "Upload document",
      description: "Add an employee or company document",
      href: "/dashboard/employer/documents/new",
      icon: "document",
    },
    {
      label: "View reports",
      description: "Review workforce and compliance reports",
      href: "/dashboard/employer/compliance/reports",
      icon: "report",
    },
  ],
};

export function formatMoney(
  amount: number,
  currency = "NGN",
  locale = "en-NG"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getPayrollStatusLabel(
  status: PayrollSnapshot["status"]
): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "processing":
      return "Processing";
    case "approved":
      return "Approved";
    case "paid":
      return "Paid";
  }
}

export function getPayrollStatusClass(
  status: PayrollSnapshot["status"]
): string {
  switch (status) {
    case "draft":
      return "bg-slate-100 text-slate-700";
    case "processing":
      return "bg-amber-100 text-amber-700";
    case "approved":
      return "bg-blue-100 text-blue-700";
    case "paid":
      return "bg-emerald-100 text-emerald-700";
  }
}
