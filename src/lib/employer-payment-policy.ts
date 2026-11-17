/** Billing, help and privacy must remain available when a subscription expires. */
export const EMPLOYER_BILLING_PATH = '/dashboard/employer/billing/plans';

export function employerMayAccessWithoutSubscription(path: string): boolean {
  return [EMPLOYER_BILLING_PATH, '/help', '/support', '/support/tickets',
    '/dashboard/employer/support', '/dashboard/employer/support-access',
    '/dashboard/employer/privacy'].includes(path);
}

export function employerMustCompleteBilling(path: string, hasPaidAccess: boolean): boolean {
  return !hasPaidAccess && !employerMayAccessWithoutSubscription(path);
}
