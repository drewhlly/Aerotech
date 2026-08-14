export type EmploymentStatus =
  | "active"
  | "probation"
  | "on_leave"
  | "suspended"
  | "terminated";

export type Employee = {
  id: string;
  employeeNumber: string;

  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  department: string;
  position: string;
  employmentType: string;
  employmentStatus: EmploymentStatus;

  dateJoined: string;
  probationEndDate?: string;

  salary: number;
  currency: "NGN" | "USD";

  manager?: string;
  location?: string;

  onboardingCompleted: boolean;
};

export const EMPLOYEES: Employee[] = [
  {
    id: "EMP-001",
    employeeNumber: "AER-0001",
    firstName: "John",
    lastName: "Adeyemi",
    email: "john.adeyemi@example.com",
    phone: "+234 800 000 0001",
    department: "Technology",
    position: "Software Engineer",
    employmentType: "Full-time",
    employmentStatus: "active",
    dateJoined: "2026-01-15",
    salary: 850000,
    currency: "NGN",
    manager: "Technology Manager",
    location: "Lagos",
    onboardingCompleted: true,
  },
  {
    id: "EMP-002",
    employeeNumber: "AER-0002",
    firstName: "Sarah",
    lastName: "Okafor",
    email: "sarah.okafor@example.com",
    phone: "+234 800 000 0002",
    department: "Human Resources",
    position: "HR Officer",
    employmentType: "Full-time",
    employmentStatus: "probation",
    dateJoined: "2026-06-01",
    probationEndDate: "2026-09-01",
    salary: 600000,
    currency: "NGN",
    manager: "HR Manager",
    location: "Lagos",
    onboardingCompleted: true,
  },
  {
    id: "EMP-003",
    employeeNumber: "AER-0003",
    firstName: "Michael",
    lastName: "Williams",
    email: "michael.williams@example.com",
    phone: "+234 800 000 0003",
    department: "Finance",
    position: "Accountant",
    employmentType: "Full-time",
    employmentStatus: "active",
    dateJoined: "2025-11-10",
    salary: 700000,
    currency: "NGN",
    manager: "Finance Manager",
    location: "Lagos",
    onboardingCompleted: true,
  },
];

export function getEmployeeById(id: string) {
  return EMPLOYEES.find((employee) => employee.id === id) || null;
}
