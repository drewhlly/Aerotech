/**
 * Aerotech Employee 360
 *
 * Canonical employee workforce model.
 */

export type EmploymentStatus =
  | "active"
  | "probation"
  | "on_leave"
  | "notice"
  | "terminated";

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "temporary"
  | "intern";

export interface EmployeeIdentity {
  id: string;
  employeeNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  country: string;
  nationality?: string;
}

export interface EmploymentRecord {
  status: EmploymentStatus;
  type: EmploymentType;
  jobTitle: string;
  department: string;
  location: string;
  managerId?: string;
  hireDate: string;
  probationEndDate?: string;
  terminationDate?: string;
}

export interface CompensationRecord {
  currency: string;
  salary: number;
  payFrequency: "monthly" | "weekly" | "biweekly" | "hourly";
  allowances: Array<{
    name: string;
    amount: number;
    taxable: boolean;
  }>;
  deductions: Array<{
    name: string;
    amount: number;
  }>;
}

export interface EmployeeComplianceRecord {
  taxId?: string;
  pensionId?: string;
  socialSecurityId?: string;
  healthInsuranceId?: string;
  documentsComplete: boolean;
  complianceStatus: "compliant" | "warning" | "non_compliant";
}

export interface Employee360 {
  identity: EmployeeIdentity;
  employment: EmploymentRecord;
  compensation: CompensationRecord;
  compliance: EmployeeComplianceRecord;
  skills: string[];
  certifications: string[];
  trainingCompleted: number;
  performanceScore?: number;
}

export const demoEmployee360: Employee360 = {
  identity: {
    id: "EMP-0001",
    employeeNumber: "AT-0001",
    firstName: "Alex",
    lastName: "Williams",
    preferredName: "Alex",
    email: "alex@example.com",
    country: "NG",
  },

  employment: {
    status: "active",
    type: "full_time",
    jobTitle: "HR Administrator",
    department: "People & Operations",
    location: "Lagos",
    hireDate: "2022-01-10",
  },

  compensation: {
    currency: "NGN",
    salary: 850000,
    payFrequency: "monthly",
    allowances: [
      {
        name: "Transport",
        amount: 75000,
        taxable: true,
      },
      {
        name: "Housing",
        amount: 100000,
        taxable: true,
      },
    ],
    deductions: [],
  },

  compliance: {
    documentsComplete: true,
    complianceStatus: "compliant",
  },

  skills: [
    "Human Resources",
    "Payroll",
    "Recruitment",
    "Employee Relations",
    "HRIS",
  ],

  certifications: [
    "HR Management",
  ],

  trainingCompleted: 12,
  performanceScore: 88,
};

export function getEmployeeDisplayName(
  employee: Employee360
): string {
  return (
    employee.identity.preferredName ||
    `${employee.identity.firstName} ${employee.identity.lastName}`
  );
}

export function getEmployeeGrossPay(
  employee: Employee360
): number {
  const allowances = employee.compensation.allowances.reduce(
    (sum, allowance) => sum + allowance.amount,
    0
  );

  return employee.compensation.salary + allowances;
}
