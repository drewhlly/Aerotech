# Reproduced Aerotech bugs

Baseline: 1,488 page checks and 334 direct API checks against disposable PostgreSQL. Repeated findings at different widths are grouped below. Final status is recorded in PR #24 checks.

| Route | Role | Problem | Root cause | Fix |
| --- | --- | --- | --- | --- |
| /aerochat | applicant |  Failed data request | Applicant accounts reached a staff-only chat client. | Restrict the page before mounting the chat client; return 403. |
| /auth/signup/applicant | employer |  React/hydration error | Runtime Intl.DisplayNames returned different country labels in Node and Chrome. | Use one static canonical country list shared by server and browser. |
| /auth/signup/applicant | employee |  React/hydration error | Runtime Intl.DisplayNames returned different country labels in Node and Chrome. | Use one static canonical country list shared by server and browser. |
| /auth/signup/applicant | logged out |  React/hydration error | Runtime Intl.DisplayNames returned different country labels in Node and Chrome. | Use one static canonical country list shared by server and browser. |
| /auth/signup/applicant | applicant |  React/hydration error | Runtime Intl.DisplayNames returned different country labels in Node and Chrome. | Use one static canonical country list shared by server and browser. |
| /auth/signup/employer | employer |  React/hydration error | Runtime Intl.DisplayNames returned different country labels in Node and Chrome. | Use one static canonical country list shared by server and browser. |
| /auth/signup/employer | employee |  React/hydration error | Runtime Intl.DisplayNames returned different country labels in Node and Chrome. | Use one static canonical country list shared by server and browser. |
| /auth/signup/employer | logged out |  React/hydration error | Runtime Intl.DisplayNames returned different country labels in Node and Chrome. | Use one static canonical country list shared by server and browser. |
| /auth/signup/employer | applicant |  React/hydration error | Runtime Intl.DisplayNames returned different country labels in Node and Chrome. | Use one static canonical country list shared by server and browser. |
| /billing | employer |  React/hydration error | Runtime Intl.DisplayNames returned different country labels in Node and Chrome. | Use one static canonical country list shared by server and browser. |
| /dashboard/employer/employees/new | employer |  React/hydration error | Runtime Intl.DisplayNames returned different country labels in Node and Chrome. | Use one static canonical country list shared by server and browser. |
| /dashboard/employer/jobs/new | employer |  React/hydration error | Runtime Intl.DisplayNames returned different country labels in Node and Chrome. | Use one static canonical country list shared by server and browser. |
| /employee/payroll/payments | employee |  Failed data request | An unassigned employee loaded a CEO-only payment client. | Check CEO assignment on the server and show access guidance before any data fetch. |
| /meet/[id] | applicant |  Failed data request | The crawl used a hired applicant and a non-invited employee for an invitation-only room. | Correct disposable fixtures; keep the actual authorisation checks. |
| /meet | applicant |  Failed data request | Meeting page fetched the employer-only staff directory for every role. | Fetch staff only when the meeting API identifies an employer. |
| /employee/vacancy-approvals | employee |  Failed data request | Employee page mounted the queue before checking the designated approver. | Check assignment on the server and show HR access guidance. |
| /pricing | logged out |  React/hydration error | Runtime Intl.DisplayNames returned different country labels in Node and Chrome. | Use one static canonical country list shared by server and browser. |
| /pricing | applicant |  React/hydration error | Runtime Intl.DisplayNames returned different country labels in Node and Chrome. | Use one static canonical country list shared by server and browser. |
| /meet/[id] | employee |  Failed data request | The crawl used a hired applicant and a non-invited employee for an invitation-only room. | Correct disposable fixtures; keep the actual authorisation checks. |
| /support/tickets | applicant | Wrong role did not receive HTTP 403 | The protected path was absent from the proxy matcher. | Add role checks and preserve the intended destination. |
| /meet | employee |  Failed data request | Meeting page fetched the employer-only staff directory for every role. | Fetch staff only when the meeting API identifies an employer. |
| /pricing | employee |  React/hydration error | Runtime Intl.DisplayNames returned different country labels in Node and Chrome. | Use one static canonical country list shared by server and browser. |
| /support/tickets | employee | Wrong role did not receive HTTP 403 | The protected path was absent from the proxy matcher. | Add role checks and preserve the intended destination. |
| /dashboard/employer/recruitment/jobs/new | employer |  React/hydration error | Runtime Intl.DisplayNames returned different country labels in Node and Chrome. | Use one static canonical country list shared by server and browser. |
| /pricing | employer |  React/hydration error | Runtime Intl.DisplayNames returned different country labels in Node and Chrome. | Use one static canonical country list shared by server and browser. |
| /api/payroll/payments/connection | Employee | Company provider readiness was returned to an ordinary employee. | GET allowed all employee sessions. | Restrict it to the company administrator and assigned CEO. |
| /, /careers, /pricing, /solutions, /support, /help, /auth/* | All | Shared title and description; no route canonical/social metadata. | Only root metadata existed. | Add explicit public/auth metadata and per-path workspace metadata. |
| /auth/login | Logged out | Server response contained only a loading placeholder. | Static useSearchParams suspense bailout. | Resolve query parameters on the server and render the form with a noscript notice. |
| /jobs, /careers | All | Jobs links used two different destinations and public careers were gated. | Legacy protected jobs route and gate-only careers page. | Use indexable careers summaries, applicant-only details and 308 legacy redirects. |
| /pricing, /pricing/checkout | Employer | Ambiguous availability, unavailable checkout, wrong enterprise CTA and lost plan choice. | Client-only billing assumptions and an unconditional billing redirect. | Server availability flag, coming-soon state, real sales contact, plan validation and safe auth return. |
| /dashboard/employer/hr/assets, /hr/tasks, /hr/goals, /training | Employer | No loading state while data requests were held. | Empty arrays represented both loading and empty results. | Add explicit loading states and distinguish them from empty and error states. |
| /dashboard/employer/hr/assets | Employer | Successful save produced no explicit confirmation. | Only values and records were updated. | Show a saved status after a successful response. |
| /dashboard/employer/recruitment/jobs/[id] | Employer | A detail page displayed unrelated vacancies. | The dynamic page ignored its ID. | Tenant-check the record and filter the workspace to the requested vacancy. |
| Recruitment candidate detail and offers routes | Employer | Shared overview component was not scoped to the named route. | The same component was mounted without record/view parameters. | Add record-specific guards and explicit jobs/candidates/offers views. |
| Sensitive forms | All | Native fallback used GET, placing submitted fields in the URL if JavaScript failed. | Forms omitted an explicit HTTP method. | Set POST on 44 client forms and provide a global noscript notice. |
| Malformed recruitment IDs | Employer | The validator accepted a malformed UUID that PostgreSQL rejects (22P02). | A character-count regex allowed arbitrary hyphen placement. | Validate UUID structure and return 404 before querying. |
| Project checks | Developer | The original ESLint configuration was empty; enabling it reproduced 88 findings. | Unused imports, unstable callbacks, effect updates and render-time clocks. | Fix findings, declare ESM, and enforce zero-warning lint in CI. |
