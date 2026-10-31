import type { Question } from "./ats";
export function validQuestions(value: unknown): value is Question[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 20 &&
    value.every(
      (q) =>
        q &&
        typeof q.prompt === "string" &&
        q.prompt.trim() &&
        q.prompt.length <= 2000 &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.options.every(
          (v: unknown) => typeof v === "string" && v.trim() && v.length <= 1000,
        ) &&
        Number.isInteger(q.correct) &&
        q.correct >= 0 &&
        q.correct <= 3,
    )
  );
}
export function validReview(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length >= 20 &&
    value.length <= 2000
  );
}
