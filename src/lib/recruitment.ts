export type RecruitmentJobStatus =
  | "draft"
  | "open"
  | "paused"
  | "closed";

export type CandidateStage =
  | "applied"
  | "screening"
  | "shortlisted"
  | "interview"
  | "assessment"
  | "offer"
  | "hired"
  | "rejected";

export type InterviewStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "rescheduled";

export type OfferStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "declined"
  | "expired";

export type RecruitmentJob = {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: "full_time" | "part_time" | "contract" | "temporary";
  openings: number;
  applicants: number;
  status: RecruitmentJobStatus;
  postedDate: string;
  closingDate?: string;
};

export type Candidate = {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  stage: CandidateStage;
  appliedDate: string;
  source: string;
  rating: number;
};

export type Interview = {
  id: string;
  candidateId: string;
  candidateName: string;
  position: string;
  interviewer: string;
  date: string;
  time: string;
  type: "phone" | "video" | "onsite";
  status: InterviewStatus;
};

export type Offer = {
  id: string;
  candidateId: string;
  candidateName: string;
  position: string;
  salary: number;
  currency: "NGN" | "USD";
  sentDate: string;
  expiryDate: string;
  status: OfferStatus;
};

export const RECRUITMENT_JOBS: RecruitmentJob[] = [
  {
    id: "JOB-001",
    title: "Restaurant Manager",
    department: "Operations",
    location: "Lagos, Nigeria",
    employmentType: "full_time",
    openings: 2,
    applicants: 38,
    status: "open",
    postedDate: "2026-08-01",
    closingDate: "2026-08-31",
  },
  {
    id: "JOB-002",
    title: "HR Officer",
    department: "Human Resources",
    location: "Lagos, Nigeria",
    employmentType: "full_time",
    openings: 1,
    applicants: 24,
    status: "open",
    postedDate: "2026-08-04",
    closingDate: "2026-08-28",
  },
  {
    id: "JOB-003",
    title: "Maintenance Technician",
    department: "Maintenance",
    location: "Lagos, Nigeria",
    employmentType: "full_time",
    openings: 3,
    applicants: 17,
    status: "open",
    postedDate: "2026-08-06",
    closingDate: "2026-09-05",
  },
];

export const CANDIDATES: Candidate[] = [
  {
    id: "CAN-001",
    name: "Daniel Okafor",
    email: "daniel@example.com",
    phone: "+234 801 000 0001",
    position: "Restaurant Manager",
    stage: "interview",
    appliedDate: "2026-08-03",
    source: "Career Portal",
    rating: 4.5,
  },
  {
    id: "CAN-002",
    name: "Sarah Williams",
    email: "sarah@example.com",
    phone: "+234 801 000 0002",
    position: "HR Officer",
    stage: "shortlisted",
    appliedDate: "2026-08-05",
    source: "LinkedIn",
    rating: 4.2,
  },
  {
    id: "CAN-003",
    name: "Michael Adeyemi",
    email: "michael@example.com",
    phone: "+234 801 000 0003",
    position: "Maintenance Technician",
    stage: "screening",
    appliedDate: "2026-08-07",
    source: "Employee Referral",
    rating: 3.8,
  },
  {
    id: "CAN-004",
    name: "Grace Johnson",
    email: "grace@example.com",
    phone: "+234 801 000 0004",
    position: "Restaurant Manager",
    stage: "offer",
    appliedDate: "2026-07-29",
    source: "Career Portal",
    rating: 4.8,
  },
];

export const INTERVIEWS: Interview[] = [
  {
    id: "INT-001",
    candidateId: "CAN-001",
    candidateName: "Daniel Okafor",
    position: "Restaurant Manager",
    interviewer: "HR & Operations",
    date: "2026-08-18",
    time: "10:00",
    type: "video",
    status: "scheduled",
  },
  {
    id: "INT-002",
    candidateId: "CAN-002",
    candidateName: "Sarah Williams",
    position: "HR Officer",
    interviewer: "HR Manager",
    date: "2026-08-19",
    time: "14:00",
    type: "video",
    status: "scheduled",
  },
];

export const OFFERS: Offer[] = [
  {
    id: "OFF-001",
    candidateId: "CAN-004",
    candidateName: "Grace Johnson",
    position: "Restaurant Manager",
    salary: 450000,
    currency: "NGN",
    sentDate: "2026-08-12",
    expiryDate: "2026-08-19",
    status: "sent",
  },
];

export function getCandidate(id: string) {
  return CANDIDATES.find((candidate) => candidate.id === id);
}

export function getJob(id: string) {
  return RECRUITMENT_JOBS.find((job) => job.id === id);
}
