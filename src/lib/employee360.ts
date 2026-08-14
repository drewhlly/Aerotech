export type EmployeeStatus =
  | "active"
  | "probation"
  | "on_leave"
  | "suspended"
  | "terminated";

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "temporary"
  | "intern";

export type Employee = {
  id: string;
  employeeNumber: string;

  firstName: string;
  lastName: string;

  email: string;
  phone?: string;

  dateOfBirth?: string;

  country: string;
  city?: string;

  department: string;
  position: string;

  managerId?: string;
  managerName?: string;

  employmentType: EmploymentType;
  status: EmployeeStatus;

  hireDate: string;
  probationEndDate?: string;

  workLocation?: string;

  currency: string;
  baseSalary: number;

  annualLeaveEntitlement: number;
  leaveBalance: number;

  attendanceRate: number;

  performanceScore?: number;
  trainingProgress?: number;

  nextReviewDate?: string;

  createdAt: string;
  updatedAt: string;
};

export const EMPLOYEES: Employee[] = [
  {
    id: "emp-00045",
    employeeNumber: "EMP-00045",

    firstName: "David",
    lastName: "Okafor",

    email: "david.okafor@aerotech.com",
    phone: "+234 803 456 7890",

    dateOfBirth: "1992-05-12",

    country: "Nigeria",
    city: "Lagos",

    department: "Product",
    position: "Product Manager",

    managerName: "Grace Johnson",

    employmentType: "full_time",
    status: "active",

    hireDate: "2024-01-15",
    probationEndDate: "2024-07-15",

    workLocation: "Lagos HQ",

    currency: "NGN",
    baseSalary: 850000,

    annualLeaveEntitlement: 20,
    leaveBalance: 14,

    attendanceRate: 96,

    performanceScore: 4.2,
    trainingProgress: 78,

    nextReviewDate: "2026-12-31",

    createdAt: "2024-01-15",
    updatedAt: "2026-08-14",
  },
];

export function getEmployee(id: string) {
  return EMPLOYEES.find((employee) => employee.id === id);
}
