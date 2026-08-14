export type TrainingStatus = "draft" | "scheduled" | "ongoing" | "completed";

export type TrainingType =
  | "onboarding"
  | "compliance"
  | "technical"
  | "leadership"
  | "soft_skills"
  | "professional";

export type Training = {
  id: string;
  title: string;
  description: string;
  type: TrainingType;
  trainer: string;
  startDate: string;
  endDate: string;
  duration: string;
  location: string;
  capacity: number;
  enrolled: number;
  status: TrainingStatus;
  certification: boolean;
};

export const TRAININGS: Training[] = [
  {
    id: "TRN-001",
    title: "Workplace Safety & Compliance",
    description:
      "Mandatory workplace safety, compliance and emergency-response training.",
    type: "compliance",
    trainer: "Aerotech Learning Team",
    startDate: "2026-08-18",
    endDate: "2026-08-18",
    duration: "4 hours",
    location: "Main Training Room",
    capacity: 50,
    enrolled: 32,
    status: "scheduled",
    certification: true,
  },
  {
    id: "TRN-002",
    title: "New Employee Onboarding",
    description:
      "Introduction to company policies, culture, systems and workplace expectations.",
    type: "onboarding",
    trainer: "HR Department",
    startDate: "2026-08-20",
    endDate: "2026-08-21",
    duration: "2 days",
    location: "Virtual",
    capacity: 30,
    enrolled: 18,
    status: "scheduled",
    certification: false,
  },
  {
    id: "TRN-003",
    title: "Leadership & People Management",
    description:
      "Practical leadership, delegation, communication and people-management skills.",
    type: "leadership",
    trainer: "External Facilitator",
    startDate: "2026-07-10",
    endDate: "2026-07-11",
    duration: "2 days",
    location: "Conference Room",
    capacity: 25,
    enrolled: 25,
    status: "completed",
    certification: true,
  },
];
