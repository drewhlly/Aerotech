export type Job = {
  id: string;
  title: string;
  department: string;
  employmentType: string;
  workplace: string;
  location: string;
  experience: string;
  salary: string;
  description: string;
  requirements: string;
  createdAt: string;
};

const STORAGE_KEY = "aerotech_jobs";

export function getJobs(): Job[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    return JSON.parse(stored) as Job[];
  } catch {
    return [];
  }
}

export function getJob(id: string): Job | null {
  const jobs = getJobs();

  return jobs.find((job) => job.id === id) ?? null;
}

export function saveJob(
  job: Omit<Job, "id" | "createdAt">
): Job {
  const newJob: Job = {
    ...job,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const jobs = getJobs();

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([newJob, ...jobs])
  );

  return newJob;
}

export function deleteJob(id: string): void {
  const jobs = getJobs();

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(jobs.filter((job) => job.id !== id))
  );
}
