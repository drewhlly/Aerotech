export type LifecycleStage =
  | "offer_accepted"
  | "preboarding"
  | "onboarding"
  | "probation"
  | "confirmed"
  | "active"
  | "offboarding"
  | "terminated";

export type OnboardingTaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "overdue";

export type OnboardingTaskCategory =
  | "documentation"
  | "it"
  | "hr"
  | "training"
  | "manager"
  | "compliance";

export type OnboardingTask = {
  id: string;
  title: string;
  description: string;
  category: OnboardingTaskCategory;
  status: OnboardingTaskStatus;
  dueDate: string;
  required: boolean;
  assignee: string;
};

export type EmployeeLifecycle = {
  id: string;
  employeeId: string;
  employeeName: string;
  jobTitle: string;
  department: string;
  startDate: string;
  currentStage: LifecycleStage;
  onboardingProgress: number;
  manager: string;
  location: string;
  employmentType: "full_time" | "part_time" | "contract";
  probationEndDate: string;
  tasks: OnboardingTask[];
};

export const LIFECYCLE_EMPLOYEES: EmployeeLifecycle[] = [
  {
    id: "LC-001",
    employeeId: "EMP-001",
    employeeName: "Amara Okafor",
    jobTitle: "Human Resources Officer",
    department: "Human Resources",
    startDate: "2026-08-18",
    currentStage: "onboarding",
    onboardingProgress: 72,
    manager: "Sarah Williams",
    location: "Lagos",
    employmentType: "full_time",
    probationEndDate: "2026-11-18",
    tasks: [
      {
        id: "T-001",
        title: "Submit signed employment contract",
        description: "Employee must submit the signed employment agreement.",
        category: "documentation",
        status: "completed",
        dueDate: "2026-08-15",
        required: true,
        assignee: "Employee",
      },
      {
        id: "T-002",
        title: "Verify identity documents",
        description: "HR should verify employee identification documents.",
        category: "compliance",
        status: "completed",
        dueDate: "2026-08-16",
        required: true,
        assignee: "HR",
      },
      {
        id: "T-003",
        title: "Create company email",
        description: "IT should create and configure the employee email account.",
        category: "it",
        status: "completed",
        dueDate: "2026-08-17",
        required: true,
        assignee: "IT",
      },
      {
        id: "T-004",
        title: "Issue laptop and equipment",
        description: "Assign required company equipment to the employee.",
        category: "it",
        status: "in_progress",
        dueDate: "2026-08-18",
        required: true,
        assignee: "IT",
      },
      {
        id: "T-005",
        title: "HR orientation",
        description: "Complete company policies and HR orientation.",
        category: "hr",
        status: "pending",
        dueDate: "2026-08-19",
        required: true,
        assignee: "HR",
      },
      {
        id: "T-006",
        title: "Department introduction",
        description: "Introduce employee to the department and immediate team.",
        category: "manager",
        status: "pending",
        dueDate: "2026-08-19",
        required: true,
        assignee: "Manager",
      },
      {
        id: "T-007",
        title: "Health & safety training",
        description: "Complete mandatory workplace health and safety training.",
        category: "training",
        status: "pending",
        dueDate: "2026-08-20",
        required: true,
        assignee: "HR",
      },
    ],
  },
  {
    id: "LC-002",
    employeeId: "EMP-002",
    employeeName: "David Adeyemi",
    jobTitle: "Operations Manager",
    department: "Operations",
    startDate: "2026-08-04",
    currentStage: "probation",
    onboardingProgress: 100,
    manager: "Michael James",
    location: "Abuja",
    employmentType: "full_time",
    probationEndDate: "2026-11-04",
    tasks: [
      {
        id: "T-101",
        title: "Employment documentation",
        description: "Complete employment documentation.",
        category: "documentation",
        status: "completed",
        dueDate: "2026-08-04",
        required: true,
        assignee: "HR",
      },
      {
        id: "T-102",
        title: "IT setup",
        description: "Complete employee IT setup.",
        category: "it",
        status: "completed",
        dueDate: "2026-08-04",
        required: true,
        assignee: "IT",
      },
      {
        id: "T-103",
        title: "Company orientation",
        description: "Complete company orientation.",
        category: "hr",
        status: "completed",
        dueDate: "2026-08-05",
        required: true,
        assignee: "HR",
      },
      {
        id: "T-104",
        title: "Management training",
        description: "Complete management training programme.",
        category: "training",
        status: "completed",
        dueDate: "2026-08-08",
        required: true,
        assignee: "HR",
      },
    ],
  },
];

export function getLifecycleEmployee(id: string) {
  return LIFECYCLE_EMPLOYEES.find((employee) => employee.id === id);
}

export const LIFECYCLE_STAGES: {
  value: LifecycleStage;
  label: string;
}[] = [
  { value: "offer_accepted", label: "Offer Accepted" },
  { value: "preboarding", label: "Pre-boarding" },
  { value: "onboarding", label: "Onboarding" },
  { value: "probation", label: "Probation" },
  { value: "confirmed", label: "Confirmed" },
  { value: "active", label: "Active" },
  { value: "offboarding", label: "Offboarding" },
  { value: "terminated", label: "Terminated" },
];
