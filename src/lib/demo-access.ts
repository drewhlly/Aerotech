/** A demo grant is only valid for its own employer, and is never paid. */
export function isActiveDemoSubscription(
  subscription: {status?: string | null; reference?: string | null; paid_until?: Date | string | null},
  employerId: string,
  now = Date.now(),
): boolean {
  return subscription.status === 'demo' &&
    subscription.reference === 'private-demo-' + employerId &&
    !!subscription.paid_until &&
    new Date(subscription.paid_until).getTime() > now;
}

/** Internal demo accounts can explore modules, but must not initiate real transfers. */
export function demoMayAccessService(path: string): boolean {
  return !(
    path.startsWith('/api/payroll/transfers')
  );
}
