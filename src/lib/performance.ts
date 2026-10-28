export type PerformanceCycleStatus =
  | "draft"
  | "open"
  | "in_review"
  | "completed";

export type ReviewStatus =
  | "pending"
  | "self_review"
  | "manager_review"
  | "completed";

export type GoalStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "overdue";

export type PerformanceRating =
  | 1
  | 2
  | 3
  | 4
  | 5;

export type PerformanceGoal = {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  category: string;
  target: string;
  progress: number;
  status: GoalStatus;
  dueDate: string;
};

export type PerformanceReview = {
  id: string;
  employeeId: string;
  cycleId: string;
  status: ReviewStatus;
  rating?: PerformanceRating;
  strengths: string;
  developmentAreas: string;
  managerComments: string;
  employeeComments: string;
};

export type PerformanceCycle = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: PerformanceCycleStatus;
  participants: number;
};

export const PERFORMANCE_CYCLES: PerformanceCycle[] = [
  {
    id: "annual-2026",
    name: "2026 Annual Performance Review",
    description:
      "Annual performance evaluation covering employee goals, KPIs, competencies and development.",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "open",
    participants: 42,
  },
];

export const PERFORMANCE_GOALS: PerformanceGoal[] = [
  {
    id: "goal-001",
    employeeId: "EMP-001",
    title: "Improve recruitment turnaround time",
    description:
      "Reduce average recruitment turnaround time for assigned vacancies.",
    category: "Recruitment",
    target: "Reduce average hiring time by 20%",
    progress: 72,
    status: "in_progress",
    dueDate: "2026-12-31",
  },
  {
    id: "goal-002",
    employeeId: "EMP-002",
    title: "Complete leadership training",
    description:
      "Complete the required leadership development programme.",
    category: "Development",
    target: "Complete all required modules",
    progress: 100,
    status: "completed",
    dueDate: "2026-09-30",
  },
];
