import {cache} from 'react';
import {currentEmployer} from './employer-session';
import {currentEmployee} from './employee-auth';
import {currentApplicant} from './applicant-session';
import {superAdmin} from './super-admin';
import {supportAgent} from './support-session';
import type {WorkspaceRole} from './portal-policy';
export const activePortal = cache(async (): Promise<WorkspaceRole | 'support' | null> => {
  if (await currentEmployer(false)) return 'employer';
  if (await currentEmployee()) return 'employee';
  if (await currentApplicant()) return 'applicant';
  if (await superAdmin()) return 'admin';
  if (await supportAgent()) return 'support';
  return null;
});
