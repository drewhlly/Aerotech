export type WorkspaceRole = 'employer' | 'employee' | 'applicant' | 'admin';
export const workspaceHomes: Record<WorkspaceRole, string> = {
  employer: '/dashboard/employer', employee: '/employee', applicant: '/applicant', admin: '/admin',
};
export function routeRole(path: string): WorkspaceRole | null {
  for (const role of Object.keys(workspaceHomes) as WorkspaceRole[]) {
    const home = workspaceHomes[role];
    if (path === home || path.startsWith(home + '/')) return role;
  }
  return null;
}
// Shared services have portal-specific page URLs; APIs keep their own RBAC.
export function workspaceLink(role: WorkspaceRole, target: string): string {
  const home = workspaceHomes[role];
  if (target === '/billing' || target.startsWith('/billing?')) return role === 'employer' ? home + '/billing/plans' + target.slice(8) : home;
  if (target.startsWith('/support') || target === '/help') return home + '/support';
  if (target === '/meet' || target.startsWith('/meet/')) return home + '/meet' + target.slice(5);
  if (target === '/aerochat') return home + '/aerochat';
  if (target === '/careers' || target.startsWith('/careers/')) return role === 'applicant' ? '/applicant/opportunities' + target.slice(8) : home;
  return routeRole(target.split('?')[0]) === role ? target : home;
}
export function linkAllowed(role: WorkspaceRole, target: string): boolean {
  if (target.startsWith('#')) return true;
  if (!target.startsWith('/') || target.startsWith('//')) return false;
  return routeRole(target.split(/[?#]/)[0]) === role;
}
