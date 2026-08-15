/**
 * Aerotech Workforce / Employee 360
 *
 * Core employee domain model.
 *
 * IMPORTANT:
 * - Employee records are country-aware.
 * - Payroll statutory rules must NOT be hard-coded here.
 * - Country-specific tax, pension, social-security and employer
 *   contribution rules belong in the payroll compliance engine.
 */

export type EmploymentStatus =
  | "active"
  | "probation"
  | "on_leave"
  | "suspended"
  | "terminated"
  | "resigned"
  | "retired";

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "temporary"
  | "intern"
  | "consultant";

export type Gender =
  | "male"
  | "female"
  | "non_binary"
  | "prefer_not_to_say";

export type PayFrequency =
  | "monthly"
  | "biweekly"
  | "weekly"
  | "daily";

export type StatutoryStatus =
  | "configured"
  | "pending"
  | "not_applicable"
  | "needs_review";

export interface EmployeeAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface BankAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
  currency: string;
  isPrimary: boolean;
}

export interface TaxProfile {
  country: string;
  taxIdentificationNumber?: string;
  taxAuthority?: string;
  taxStatus?: string;
  taxReliefCode?: string;
  filingStatus?: string;
  effectiveFrom?: string;
  status: StatutoryStatus;
}

export interface PensionProfile {
  country: string;
  pensionScheme?: string;
  pensionProvider?: string;
  pensionId?: string;
  employeeRate?: number;
  employerRate?: number;
  effectiveFrom?: string;
  status: StatutoryStatus;
}

export interface SocialSecurityProfile {
  country: string;
  scheme?: string;
  identificationNumber?: string;
  employeeRate?: number;
  employerRate?: number;
  effectiveFrom?: string;
  status: StatutoryStatus;
}

export interface Compensation {
  currency: string;
  payFrequency: PayFrequency;
  baseSalary: number;
  housingAllowance?: number;
  transportAllowance?: number;
  mealAllowance?: number;
  communicationAllowance?: number;
  otherAllowances?: number;
  effectiveFrom: string;
}

export interface EmployeeDocument {
  id: string;
  name: string;
  type: string;
  status: "valid" | "expiring" | "expired" | "missing";
  expiresAt?: string;
  uploadedAt?: string;
}

export interface EmployeeTimelineEvent {
  id: string;
  date: string;
  type:
    | "joined"
    | "promotion"
    | "transfer"
    | "salary_change"
    | "leave"
    | "training"
    | "performance"
    | "warning"
    | "document"
    | "payroll"
    | "termination"
    | "other";
  title: string;
  description?: string;
  actor?: string;
}

export interface EmployeeRecord {
  id: string;
  employeeNumber: string;

  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;

  email: string;
  personalEmail?: string;
  phone?: string;

  dateOfBirth?: string;
  gender?: Gender;

  nationality?: string;

  address?: EmployeeAddress;
  emergencyContact?: EmergencyContact;

  country: string;
  workLocation?: string;
  department: string;
  jobTitle: string;
  managerId?: string;

  employmentStatus: EmploymentStatus;
  employmentType: EmploymentType;

  hireDate: string;
  probationEndDate?: string;
  terminationDate?: string;

  compensation: Compensation;

  bankAccounts: BankAccount[];

  taxProfile: TaxProfile;
  pensionProfile: PensionProfile;
  socialSecurityProfile: SocialSecurityProfile;

  documents: EmployeeDocument[];
  timeline: EmployeeTimelineEvent[];

  createdAt: string;
  updatedAt: string;
}

export const workforceStats = {
  totalEmployees: 248,
  activeEmployees: 231,
  onProbation: 9,
  onLeave: 8,
  newThisMonth: 14,
  pendingDocuments: 7,
  expiringDocuments: 12,
  payrollReady: 224,
};

export const employees: EmployeeRecord[] = [
  {
    id: "emp-001",
    employeeNumber: "AER-0001",
    firstName: "Amaka",
    lastName: "Okafor",
    preferredName: "Amaka",
    email: "amaka.okafor@company.com",
    phone: "+234 800 000 0001",
    dateOfBirth: "1993-05-18",
    gender: "female",
    nationality: "Nigerian",
    country: "NG",
    workLocation: "Lagos",
    department: "Human Resources",
    jobTitle: "HR Manager",
    employmentStatus: "active",
    employmentType: "full_time",
    hireDate: "2022-04-11",

    compensation: {
      currency: "NGN",
      payFrequency: "monthly",
      baseSalary: 850000,
      housingAllowance: 150000,
      transportAllowance: 100000,
      effectiveFrom: "2026-01-01",
    },

    bankAccounts: [
      {
        bankName: "Example Bank",
        accountName: "Amaka Okafor",
        accountNumber: "********1234",
        currency: "NGN",
        isPrimary: true,
      },
    ],

    taxProfile: {
      country: "NG",
      taxIdentificationNumber: "TIN-********",
      taxAuthority: "Relevant Tax Authority",
      status: "configured",
    },

    pensionProfile: {
      country: "NG",
      pensionScheme: "Contributory Pension Scheme",
      pensionProvider: "Configured Pension Fund Administrator",
      pensionId: "PEN-********",
      employeeRate: 8,
      employerRate: 10,
      status: "configured",
    },

    socialSecurityProfile: {
      country: "NG",
      scheme: "Configured statutory scheme",
      identificationNumber: "SS-********",
      status: "needs_review",
    },

    documents: [
      {
        id: "doc-001",
        name: "Employment Contract",
        type: "contract",
        status: "valid",
        uploadedAt: "2022-04-11",
      },
      {
        id: "doc-002",
        name: "National Identification",
        type: "identity",
        status: "valid",
        uploadedAt: "2022-04-11",
      },
    ],

    timeline: [
      {
        id: "event-001",
        date: "2022-04-11",
        type: "joined",
        title: "Joined Aerotech",
        description: "Employee joined the organization.",
      },
    ],

    createdAt: "2022-04-11",
    updatedAt: "2026-08-15",
  },

  {
    id: "emp-002",
    employeeNumber: "AER-0002",
    firstName: "Daniel",
    lastName: "Williams",
    email: "daniel.williams@company.com",
    phone: "+234 800 000 0002",
    nationality: "Nigerian",
    country: "NG",
    workLocation: "Lagos",
    department: "Technology",
    jobTitle: "Software Engineer",
    employmentStatus: "active",
    employmentType: "full_time",
    hireDate: "2024-02-05",

    compensation: {
      currency: "NGN",
      payFrequency: "monthly",
      baseSalary: 700000,
      transportAllowance: 80000,
      communicationAllowance: 30000,
      effectiveFrom: "2026-01-01",
    },

    bankAccounts: [
      {
        bankName: "Example Bank",
        accountName: "Daniel Williams",
        accountNumber: "********5678",
        currency: "NGN",
        isPrimary: true,
      },
    ],

    taxProfile: {
      country: "NG",
      status: "configured",
    },

    pensionProfile: {
      country: "NG",
      pensionScheme: "Contributory Pension Scheme",
      employeeRate: 8,
      employerRate: 10,
      status: "configured",
    },

    socialSecurityProfile: {
      country: "NG",
      status: "needs_review",
    },

    documents: [],
    timeline: [
      {
        id: "event-002",
        date: "2024-02-05",
        type: "joined",
        title: "Joined Aerotech",
      },
    ],

    createdAt: "2024-02-05",
    updatedAt: "2026-08-15",
  },
];

export function getEmployee(id: string) {
  return employees.find((employee) => employee.id === id);
}

export function getEmployeesByCountry(country: string) {
  return employees.filter(
    (employee) => employee.country.toLowerCase() === country.toLowerCase()
  );
}

export function getEmployeesByDepartment(department: string) {
  return employees.filter(
    (employee) =>
      employee.department.toLowerCase() === department.toLowerCase()
  );
}

export function getEmployeeDisplayName(employee: EmployeeRecord) {
  return (
    employee.preferredName ||
    `${employee.firstName} ${employee.lastName}`
  );
}

export function getEmployeeGrossSalary(employee: EmployeeRecord) {
  const compensation = employee.compensation;

  return (
    compensation.baseSalary +
    (compensation.housingAllowance || 0) +
    (compensation.transportAllowance || 0) +
    (compensation.mealAllowance || 0) +
    (compensation.communicationAllowance || 0) +
    (compensation.otherAllowances || 0)
  );
}

export function getStatutoryReadiness(employee: EmployeeRecord) {
  const profiles = [
    employee.taxProfile,
    employee.pensionProfile,
    employee.socialSecurityProfile,
  ];

  const configured = profiles.filter(
    (profile) => profile.status === "configured"
  ).length;

  return Math.round((configured / profiles.length) * 100);
}
