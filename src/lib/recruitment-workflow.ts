export type JobStatus = "draft" | "open" | "paused" | "closed";

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
  | "no_show";

export type AssessmentStatus =
  | "pending"
  | "in_progress"
  | "completed";

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
  employmentType: string;
  status: JobStatus;
  applicants: number;
  openings: number;
  createdAt: string;
};

export type Candidate = {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  stage: CandidateStage;
  score: number;
  appliedAt: string;
  source: string;
  experience: string;
};

export type Interview = {
  id: string;
  candidateId: string;
  type: string;
  interviewer: string;
  scheduledAt: string;
  duration: number;
  status: InterviewStatus;
  notes?: string;
};

export type Assessment = {
  id: string;
  candidateId: string;
  name: string;
  score: number | null;
  maxScore: number;
  status: AssessmentStatus;
  completedAt?: string;
};

export type Offer = {
  id: string;
  candidateId: string;
  jobTitle: string;
  salary: number;
  currency: "NGN" | "USD";
  startDate: string;
  status: OfferStatus;
  expiresAt: string;
};

export const RECRUITMENT_JOBS: RecruitmentJob[] = [
  {
    id: "job-001",
    title: "HR Manager",
    department: "Human Resources",
    location: "Lagos, Nigeria",
    employmentType: "Full-time",
    status: "open",
    applicants: 28,
    openings: 1,
    createdAt: "2026-08-01",
  },
  {
    id: "job-002",
    title: "Maintenance Supervisor",
    department: "Operations",
    location: "Lagos, Nigeria",
    employmentType: "Full-time",
    status: "open",
    applicants: 17,
    openings: 1,
    createdAt: "2026-08-04",
  },
  {
    id: "job-003",
    title: "Software Engineer",
    department: "Technology",
    location: "Remote",
    employmentType: "Full-time",
    status: "open",
    applicants: 42,
    openings: 2,
    createdAt: "2026-08-07",
  },
];

export const CANDIDATES: Candidate[] = [
  {
    id: "candidate-001",
    jobId: "job-001",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "+234 801 000 0001",
    location: "Lagos, Nigeria",
    stage: "interview",
    score: 87,
    appliedAt: "2026-08-03",
    source: "Company Website",
    experience: "6 years",
  },
  {
    id: "candidate-002",
    jobId: "job-001",
    name: "Michael Adeyemi",
    email: "michael.adeyemi@example.com",
    phone: "+234 801 000 0002",
    location: "Lagos, Nigeria",
    stage: "assessment",
    score: 82,
    appliedAt: "2026-08-04",
    source: "LinkedIn",
    experience: "5 years",
  },
  {
    id: "candidate-003",
    jobId: "job-002",
    name: "David Okoro",
    email: "david.okoro@example.com",
    phone: "+234 801 000 0003",
    location: "Abuja, Nigeria",
    stage: "shortlisted",
    score: 79,
    appliedAt: "2026-08-05",
    source: "Referral",
    experience: "7 years",
  },
];

export const INTERVIEWS: Interview[] = [
  {
    id: "int-001",
    candidateId: "candidate-001",
    type: "Panel Interview",
    interviewer: "HR & Operations Panel",
    scheduledAt: "2026-08-20T10:00:00",
    duration: 60,
    status: "scheduled",
  },
];

export const ASSESSMENTS: Assessment[] = [
  {
    id: "assessment-001",
    candidateId: "candidate-002",
    name: "HR Management Assessment",
    score: 82,
    maxScore: 100,
    status: "completed",
    completedAt: "2026-08-17",
  },
];

export const OFFERS: Offer[] = [];

export function getCandidate(id: string) {
  return CANDIDATES.find((candidate) => candidate.id === id);
}

export function getJob(id: string) {
  return RECRUITMENT_JOBS.find((job) => job.id === id);
}

export function getCandidateInterviews(candidateId: string) {
  return INTERVIEWS.filter(
    (interview) => interview.candidateId === candidateId
  );
}

export function getCandidateAssessment(candidateId: string) {
  return ASSESSMENTS.find(
    (assessment) => assessment.candidateId === candidateId
  );
}

export function getCandidateOffer(candidateId: string) {
  return OFFERS.find((offer) => offer.candidateId === candidateId);
}
