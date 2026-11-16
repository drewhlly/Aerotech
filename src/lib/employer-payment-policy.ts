/** A pending employer session may open billing, but no employer workspace pages. */
export const EMPLOYER_BILLING_PATH = '/dashboard/employer/billing/plans';

export function employerMustCompleteBilling(path: string, hasPaidAccess: boolean): boolean {
  return !hasPaidAccess && path !== EMPLOYER_BILLING_PATH;
}
