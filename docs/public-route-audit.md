# Aerotech audit and QA report

The complete reproduced bug table is in [audit-bugs.md](audit-bugs.md). The 1,488-row baseline is in [audit-route-baseline.csv](audit-route-baseline.csv); all 88 original lint findings are listed in [audit-lint-baseline.json](audit-lint-baseline.json).

Review: https://github.com/drewhlly/Aerotech/pull/24

Source checks: https://github.com/drewhlly/Aerotech/actions/runs/40359169131

Browser/API/route evidence: https://github.com/drewhlly/Aerotech/actions/runs/40359169175

## Verification evidence

- Local build, strict zero-warning lint, TypeScript and 32 smoke tests passed before the workspace became unavailable.
- Local isolated PGlite accounts and real PostgreSQL in CI were used; test accounts never used production data.
- The baseline covered 124 page routes (72 employer pages) and 86 API routes, four roles and 360/768/1280 widths: 1,488 page checks and 334 API checks.
- Local browser checks confirmed the country hydration fix, dashboard loading/error/save feedback, corrected vacancy scoping and POST native form fallback.
- All 51 public route/breakpoint checks passed locally, including keyboard navigation, WCAG AA checks, recovery, ticket submission and checkout return paths.
- Final CI source checks passed: build, zero-warning lint, TypeScript and 32 tests. All 17 signed-in journeys, 1,488 page checks and 334 API checks passed; the crawl reported zero unexpected findings.
- All 51 public route/breakpoint checks passed in CI. Dashboard state probes verified loading/error feedback across 19 core routes, save confirmation and CSV export.
- Baseline artifact: https://github.com/drewhlly/Aerotech/actions/runs/40303139712/artifacts/12641996778

### Lighthouse mobile lab results

| Page | Performance | Accessibility | Best practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| / | 99 | 100 | 100 | 100 |
| /careers | 98 | 100 | 100 | 100 |
| /pricing | 98 | 100 | 100 | 100 |
| /solutions | 98 | 100 | 100 | 100 |
| /support | 98 | 100 | 100 | 100 |
| /help | 98 | 100 | 100 | 69 |
| /auth/login | 98 | 100 | 100 | 69 |

Help/auth are intentionally noindex; their SEO crawlability deduction is expected. These are the final CI mobile lab results, not production field Core Web Vitals.

## Design decisions and verification limits

- Employee routes are /employee/*; applicant routes are /applicant/*, rather than nonexistent /dashboard/employee/* or /dashboard/applicant/*.
- Public careers summaries use ItemList. JobPosting belongs to the authenticated single-job page. Login-gated full descriptions are not eligible for Google job rich results.
- Online checkout remains unavailable until a live Paystack merchant key is configured. No real payment was executed.
- Camera face matching, real meeting media, email inbox delivery and phone reachability were not verified against live providers. They are not presented as activated capabilities.
- CSP retains inline script/style allowance for Next.js static hydration; it is not a nonce-based strict CSP.
- The current-source credential-pattern scan found no provider secret, private key, GitHub token or external database password. This is not a complete git-history or dependency audit.
- npm install still reports upstream deprecation warnings from the existing spreadsheet dependency chain and a resolver install-script policy notice. Application lint has zero warnings; replacing that dependency was not attempted without export compatibility coverage.
- The original workspace disconnected during final checks. Recovered changes were preserved on GitHub and revalidated through CI; the workspace later became available again.
- Automated crawling records every route and API boundary. State/action tests cover shared dashboard families and core signed-in workflows, not every possible conditional button/data combination. The payroll overview empty-state probe retained its nested payroll object, so that particular empty-state simulation needs a separate fresh-company check.

## Manual QA checklist

- [ ] Check home, careers, pricing, solutions, support/help and every auth entry at 360/768/1280.
- [ ] Tab through header, mobile menu, role chooser and forms; confirm focus visibility, labels and password toggles.
- [ ] Check the server-rendered sign-in form and no-JavaScript notice; ensure sensitive forms use POST.
- [ ] Switch Nigeria/United States/unpriced countries, reload and confirm persistence and clear quote/coming-soon states.
- [ ] Check basic/professional/business/enterprise and invalid checkout parameters; preserve selected plan through signup/login.
- [ ] Open each workspace logged out and as the wrong role; confirm login next and HTTP 403 rather than a crash.
- [ ] Check CV/CSV uploads, saved records, download exports, NGN/date displays and tenant isolation with test accounts.
- [ ] Hold/fail requests, provide empty data and save a record; distinguish loading, empty, error and success states.
- [ ] Check vacancy/candidate detail links display only the selected record.
- [ ] Submit and read a test ticket; test expired and reused recovery tokens.
- [ ] Verify custom 404 and a safe error boundary in a non-production environment.

## File-by-file changes

| File | Change |
| --- | --- |
| `.github/workflows/ci.yml` | Enforce lint/type/build checks and run disposable role, route, state, accessibility and Lighthouse verification. |
| `.github/workflows/signed-in-verification.yml` | Enforce lint/type/build checks and run disposable role, route, state, accessibility and Lighthouse verification. |
| `database/036_password_recovery.sql` | Hashed, expiring, single-use password recovery tokens. |
| `docs/audit-bugs.md` | Audit evidence, findings or verification/file summary. |
| `docs/audit-lint-baseline.json` | Audit evidence, findings or verification/file summary. |
| `docs/audit-route-baseline.csv` | Audit evidence, findings or verification/file summary. |
| `docs/public-route-audit.md` | Audit evidence, findings or verification/file summary. |
| `eslint.config.mjs` | Enable real Next.js/TypeScript lint checks. |
| `next.config.ts` | Canonical redirects and security/permissions headers. |
| `package.json` | Declare ESM and make lint fail on warnings. |
| `scripts/migrate.mjs` | Migration or reproducible disposable QA coverage. |
| `scripts/test-support-enrollment.mjs` | Migration or reproducible disposable QA coverage. |
| `scripts/test-support-flow.mjs` | Migration or reproducible disposable QA coverage. |
| `scripts/verify-dashboard-states.mjs` | Migration or reproducible disposable QA coverage. |
| `scripts/verify-public-routes.mjs` | Migration or reproducible disposable QA coverage. |
| `scripts/verify-route-crawl.mjs` | Migration or reproducible disposable QA coverage. |
| `scripts/verify-signed-in.mjs` | Migration or reproducible disposable QA coverage. |
| `src/app/admin/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/aerochat/layout.tsx` | Route metadata, role-aware navigation/access checks or safe return destinations. |
| `src/app/aerochat/page.tsx` | Role-appropriate access, data fetching and return navigation. |
| `src/app/api/ats/route.ts` | Public summaries only; authenticated full details and assessments. |
| `src/app/api/auth/password/route.ts` | Secure password recovery, account throttling and session invalidation. |
| `src/app/api/billing/route.ts` | Disable initialisation when real billing is unavailable. |
| `src/app/api/cron/payslip-notices/route.ts` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/api/hr/attendance/faces/route.ts` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/api/hr/lifecycle/[module]/route.ts` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/api/payroll/payments/connection/route.ts` | Limit provider-status access to administrator or assigned CEO. |
| `src/app/applicant/layout.tsx` | Route metadata, role-aware navigation/access checks or safe return destinations. |
| `src/app/auth/activate/layout.tsx` | Route metadata, role-aware navigation/access checks or safe return destinations. |
| `src/app/auth/activate/page.tsx` | Server-rendered/accessible authentication, recovery, invitation guidance or safe POST fallback. |
| `src/app/auth/forgot-password/page.tsx` | Server-rendered/accessible authentication, recovery, invitation guidance or safe POST fallback. |
| `src/app/auth/login/layout.tsx` | Route metadata, role-aware navigation/access checks or safe return destinations. |
| `src/app/auth/login/page.tsx` | Server-rendered/accessible authentication, recovery, invitation guidance or safe POST fallback. |
| `src/app/auth/reset-password/page.tsx` | Server-rendered/accessible authentication, recovery, invitation guidance or safe POST fallback. |
| `src/app/auth/signup/applicant/layout.tsx` | Route metadata, role-aware navigation/access checks or safe return destinations. |
| `src/app/auth/signup/applicant/page.tsx` | Server-rendered/accessible authentication, recovery, invitation guidance or safe POST fallback. |
| `src/app/auth/signup/employee/layout.tsx` | Route metadata, role-aware navigation/access checks or safe return destinations. |
| `src/app/auth/signup/employee/page.tsx` | Server-rendered/accessible authentication, recovery, invitation guidance or safe POST fallback. |
| `src/app/auth/signup/employer/layout.tsx` | Route metadata, role-aware navigation/access checks or safe return destinations. |
| `src/app/auth/signup/employer/page.tsx` | Server-rendered/accessible authentication, recovery, invitation guidance or safe POST fallback. |
| `src/app/auth/signup/layout.tsx` | Route metadata, role-aware navigation/access checks or safe return destinations. |
| `src/app/auth/signup/page.tsx` | Server-rendered/accessible authentication, recovery, invitation guidance or safe POST fallback. |
| `src/app/billing/layout.tsx` | Route metadata, role-aware navigation/access checks or safe return destinations. |
| `src/app/billing/page.tsx` | Clear availability, validated plan/country selection, real sales CTA and aligned price layout. |
| `src/app/careers/[id]/page.tsx` | Public indexable summaries, protected details and canonical legacy redirects. |
| `src/app/careers/page.tsx` | Public indexable summaries, protected details and canonical legacy redirects. |
| `src/app/dashboard/employer/ai/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/dashboard/employer/employees/import/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/dashboard/employer/employees/new/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/dashboard/employer/employees/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/dashboard/employer/exits/page.tsx` | Access/assignment checks, explicit loading and mutation feedback. |
| `src/app/dashboard/employer/hr/attendance/page.tsx` | Distinguish loading from empty attendance; show assignment progress. |
| `src/app/dashboard/employer/hr/attendance/verification/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/dashboard/employer/hr/birthdays/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/dashboard/employer/hr/departments/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/dashboard/employer/hr/shifts/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/dashboard/employer/hr/surveys/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/dashboard/employer/layout.tsx` | Route metadata, role-aware navigation/access checks or safe return destinations. |
| `src/app/dashboard/employer/notifications/page.tsx` | Access/assignment checks, explicit loading and mutation feedback. |
| `src/app/dashboard/employer/payroll/approvers/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/dashboard/employer/payroll/run/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/dashboard/employer/payroll/setup/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/dashboard/employer/payroll/wallet/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/dashboard/employer/recruitment/candidates/[id]/assessment/page.tsx` | Scope jobs, candidates, offers and detail views to the requested route. |
| `src/app/dashboard/employer/recruitment/candidates/[id]/interviews/page.tsx` | Scope jobs, candidates, offers and detail views to the requested route. |
| `src/app/dashboard/employer/recruitment/candidates/[id]/offer/page.tsx` | Scope jobs, candidates, offers and detail views to the requested route. |
| `src/app/dashboard/employer/recruitment/candidates/[id]/page.tsx` | Scope jobs, candidates, offers and detail views to the requested route. |
| `src/app/dashboard/employer/recruitment/candidates/page.tsx` | Scope jobs, candidates, offers and detail views to the requested route. |
| `src/app/dashboard/employer/recruitment/jobs/[id]/page.tsx` | Scope jobs, candidates, offers and detail views to the requested route. |
| `src/app/dashboard/employer/recruitment/jobs/page.tsx` | Scope jobs, candidates, offers and detail views to the requested route. |
| `src/app/dashboard/employer/recruitment/offers/page.tsx` | Scope jobs, candidates, offers and detail views to the requested route. |
| `src/app/dashboard/employer/requests/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/employee/attendance/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/employee/birthdays/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/employee/layout.tsx` | Route metadata, role-aware navigation/access checks or safe return destinations. |
| `src/app/employee/notifications/page.tsx` | Access/assignment checks, explicit loading and mutation feedback. |
| `src/app/employee/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/employee/payroll/approvals/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/employee/payroll/payments/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/employee/payroll/statements/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/employee/surveys/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/employee/vacancy-approvals/page.tsx` | Access/assignment checks, explicit loading and mutation feedback. |
| `src/app/error.tsx` | Safe error/access UI with home, retry or role-selection actions. |
| `src/app/forbidden/page.tsx` | Safe error/access UI with home, retry or role-selection actions. |
| `src/app/global-error.tsx` | Safe error/access UI with home, retry or role-selection actions. |
| `src/app/globals.css` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/help/page.tsx` | Working support access, contact configuration or safe ticket form handling. |
| `src/app/jobs/[id]/page.tsx` | Public indexable summaries, protected details and canonical legacy redirects. |
| `src/app/jobs/layout.tsx` | Route metadata, role-aware navigation/access checks or safe return destinations. |
| `src/app/jobs/page.tsx` | Public indexable summaries, protected details and canonical legacy redirects. |
| `src/app/layout.tsx` | Route metadata, role-aware navigation/access checks or safe return destinations. |
| `src/app/meet/layout.tsx` | Route metadata, role-aware navigation/access checks or safe return destinations. |
| `src/app/meet/page.tsx` | Role-appropriate access, data fetching and return navigation. |
| `src/app/not-found.tsx` | Safe error/access UI with home, retry or role-selection actions. |
| `src/app/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/pricing/checkout/page.tsx` | Clear availability, validated plan/country selection, real sales CTA and aligned price layout. |
| `src/app/pricing/layout.tsx` | Route metadata, role-aware navigation/access checks or safe return destinations. |
| `src/app/pricing/page.tsx` | Clear availability, validated plan/country selection, real sales CTA and aligned price layout. |
| `src/app/robots.ts` | Unique title/description, canonical/social/crawl metadata. |
| `src/app/sitemap.ts` | Unique title/description, canonical/social/crawl metadata. |
| `src/app/solutions/page.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/app/support-console/enroll/page.tsx` | Working support access, contact configuration or safe ticket form handling. |
| `src/app/support-console/layout.tsx` | Route metadata, role-aware navigation/access checks or safe return destinations. |
| `src/app/support-console/login/page.tsx` | Working support access, contact configuration or safe ticket form handling. |
| `src/app/support-console/page.tsx` | Working support access, contact configuration or safe ticket form handling. |
| `src/app/support/page.tsx` | Working support access, contact configuration or safe ticket form handling. |
| `src/app/support/tickets/page.tsx` | Working support access, contact configuration or safe ticket form handling. |
| `src/components/aerotech-portal.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/components/aerotech-ui.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/components/aerotech-workforce-os.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/components/brand-logo.tsx` | Optimised image with explicit dimensions and the existing brand. |
| `src/components/candidate-import.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/components/company-feedback.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/components/country-select.tsx` | Stable country labels, deduplicated options and consistent billing-country values. |
| `src/components/document-submissions.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/components/employee-learning.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/components/employee-lifecycle.tsx` | Loading/empty/error/save states, stable callbacks and safe POST fallback. |
| `src/components/employee-profile-workspace.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/components/help-desk.tsx` | Working support access, contact configuration or safe ticket form handling. |
| `src/components/hr-records.tsx` | Loading/empty/error/save states, stable callbacks and safe POST fallback. |
| `src/components/hr-workflow.tsx` | Loading/empty/error/save states, stable callbacks and safe POST fallback. |
| `src/components/live-reports.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/components/login-form.tsx` | Server-rendered/accessible authentication, recovery, invitation guidance or safe POST fallback. |
| `src/components/password-input.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/components/password-recovery.tsx` | Server-rendered/accessible authentication, recovery, invitation guidance or safe POST fallback. |
| `src/components/payroll-payments.tsx` | Access/assignment checks, explicit loading and mutation feedback. |
| `src/components/pricing-page.tsx` | Clear availability, validated plan/country selection, real sales CTA and aligned price layout. |
| `src/components/recruitment-detail.tsx` | Tenant-scoped record lookup and malformed/unknown ID handling. |
| `src/components/recruitment-workspace.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/components/salary-bands.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/components/site-navigation.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/components/staff-confirmations.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/components/support-workspace.tsx` | Working support access, contact configuration or safe ticket form handling. |
| `src/components/vacancy-approvals.tsx` | Access/assignment checks, explicit loading and mutation feedback. |
| `src/components/workflow-workspace.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/components/workspace-shell.tsx` | Resolve reproduced lint/react findings, correct navigation/copy or secure native form submission. |
| `src/lib/auth-navigation.ts` | Early role checks, HTTP 403 responses and validated return paths. |
| `src/lib/countries.ts` | Stable country labels, deduplicated options and consistent billing-country values. |
| `src/lib/portal-routing.ts` | Early role checks, HTTP 403 responses and validated return paths. |
| `src/lib/public-jobs.ts` | Public indexable summaries, protected details and canonical legacy redirects. |
| `src/lib/regional-pricing.ts` | Stable country labels, deduplicated options and consistent billing-country values. |
| `src/lib/route-metadata.ts` | Unique title/description, canonical/social/crawl metadata. |
| `src/lib/seo.ts` | Unique title/description, canonical/social/crawl metadata. |
| `src/lib/subscriptions.ts` | Clear availability, validated plan/country selection, real sales CTA and aligned price layout. |
| `src/lib/support-contact.ts` | Working support access, contact configuration or safe ticket form handling. |
| `src/proxy.ts` | Early role checks, HTTP 403 responses and validated return paths. |
| `tests/launch-smoke.test.mjs` | Update canonical-route and applicant access regression expectations. |
| `tests/portal-automation.test.mjs` | Update canonical-route and applicant access regression expectations. |
