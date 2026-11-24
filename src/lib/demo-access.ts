/** Explicit internal demo access lasts until revoked by changing status or reference. Never paid. */
export function isActiveDemoSubscription(
  subscription: {status?: string | null; reference?: string | null; paid_until?: Date | string | null},
  employerId: string,
): boolean {
  return subscription.status === 'demo' &&
    subscription.reference === 'private-demo-' + employerId;
}

/** Internal demo accounts can explore modules, but must not initiate real transfers. */
export function demoMayAccessService(path: string): boolean {
  return !(
    path.startsWith('/api/payroll/payments') ||
    path.startsWith('/api/payroll/payout') ||
    path.startsWith('/api/payroll/transfers')
  );
}
