import type { Question } from "./ats";
export type AssessmentPolicy = {
  version: 1;
  threshold: number;
  questions: Question[];
  review?: { reason: string; at: string };
};
export function assessmentPolicy(value: unknown): AssessmentPolicy | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const p = value as AssessmentPolicy;
  return p.version === 1 &&
    Number.isInteger(p.threshold) &&
    p.threshold >= 0 &&
    p.threshold <= 100 &&
    Array.isArray(p.questions) &&
    p.questions.length > 0
    ? p
    : null;
}
export function publicAssessmentPolicy(value: unknown) {
  const p = assessmentPolicy(value);
  return p
    ? {
        version: p.version,
        threshold: p.threshold,
        questions: p.questions.map((q) => ({
          prompt: q.prompt,
          options: q.options,
        })),
        reviewed: !!p.review,
      }
    : null;
}
export function screeningStage(score: number, threshold: number) {
  return score >= threshold ? "shortlisted" : "screening";
}
