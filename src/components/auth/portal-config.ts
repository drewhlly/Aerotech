import { portalHomes } from '@/lib/portal-routing';
export type LoginPortal = 'applicant' | 'employee' | 'employer';
export const portalConfig = {
  applicant: {
    redirectTarget: portalHomes.applicant, name: 'Applicant Portal', title: 'Applicant Login',
    subtitle: 'Find your next opportunity and keep track of your applications.',
    accent: 'YOUR NEXT CHAPTER', welcome: 'Move your career forward.',
    message: 'Discover jobs that fit your ambitions. Keep your applications, assessments and interviews together in one place.',
    highlights: ['Find opportunities that fit you', 'Track every step of your application', 'Stay ready for your next interview'],
    signup: '/auth/signup/applicant', signupLabel: 'Create an account',
  },
  employee: {
    redirectTarget: portalHomes.employee, name: 'Employee Portal', title: 'Employee Login',
    subtitle: 'Access your attendance, schedules and work records in one place.',
    accent: 'YOUR EVERYDAY WORKSPACE', welcome: 'A clearer view of your workday.',
    message: 'Stay connected to your organisation, manage everyday requests and find the records you need, when you need them.',
    highlights: ['View attendance and schedules', 'Follow leave requests and work records', 'Keep up with your team and company'],
    signup: null, signupLabel: null,
  },
  employer: {
    redirectTarget: portalHomes.employer, name: 'Employer Portal', title: 'Employer Login',
    subtitle: 'Manage your hiring and workforce needs from one connected workspace.',
    accent: 'PEOPLE OPERATIONS, CONNECTED', welcome: 'Build a stronger workforce.',
    message: 'Bring hiring, employee records and everyday workforce operations together, so your team can focus on what comes next.',
    highlights: ['Manage hiring and candidates', 'Keep your workforce records organised', 'Connect your people operations'],
    signup: '/auth/signup/employer', signupLabel: 'Register your organisation',
  },
} as const;
