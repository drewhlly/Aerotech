# Consolidated release checkpoint — 31 October 2026

This branch is a checkpoint, not completion of the consolidated development handoff. Do not promote it as a complete release. The production baseline is d693897b66d0a9baa5b539250d5f975db86660dc. No production records or database schema were changed by this checkpoint.

## Reproduced findings and changes

| Area | Reproduced finding | Change |
| --- | --- | --- |
| Aerochat API | Replaying the same delivery request inserted two messages | Tenant/sender scoped delivery identifiers; transactional replay lookup; changed-text conflict; stable ordering and no-store responses |
| Aerochat client | Sending did not immediately retain the server acknowledgement; retries lacked a stable identifier | Stable retry identifier, immediate acknowledged message, separate connection/send errors, reconnect/visibility refresh and double-submit guard |
| Employee navigation | Recruitment and salary payments were exposed in the standard employee menu | Removed both; added responsibility-controlled My approvals |
| Employee recruitment routes | Existing opportunities pages exposed recruitment within the employee portal | Denied before rendering and at page level |
| Employee approval APIs | An employee without approval responsibilities could load empty payroll/manager review views | Explicit responsibility checks, tenant scope and denial of self-review |
| Payroll/leave decision requests | Null request bodies could cause exceptions | Typed body validation before access to fields |
| Protected-page response status | A render-time forbidden response was streamed with HTTP 200 | Pre-render request guard for approval and retired recruitment routes |
| Integration runner | Integration files required separate manual commands | One command discovers and runs every integration suite and fails if any suite fails |
| AI API tests | Old tests expected the retired provider contract | Test the current provider's quota, outage, empty response and transport failure contract |

The disposable PGlite socket fixture also reproduced a Parse/Bind protocol collision with concurrent connections. A test-only preload shares one app connection. This adapter is never used in production. Browser tests use synthetic localhost identities and a disposable database, never production accounts.

## Changes by file

- `src/app/api/aerochat/route.ts`: message replay protection, transactional delivery and response contract.
- `src/components/team-chat.tsx`: reliable delivery acknowledgement, retries and connection states.
- `src/lib/employee-approval-access.ts`: assignment and direct-report permission queries, including pre-render session checks.
- `src/proxy.ts`: early HTTP 403 for removed recruitment pages and unassigned approval pages.
- `src/app/employee/layout.tsx`: server-computed approval visibility.
- `src/components/employee-nav.tsx`: remove recruitment/payment navigation and expose assigned approvals only.
- `src/components/workspace-shell.tsx`: pass serialisable navigation props to the employee navigation.
- `src/app/employee/approvals/page.tsx`: guarded approval hub.
- `src/app/employee/approvals/payments/page.tsx`: CEO-assignment-only payment authorisation view.
- `src/app/employee/payroll/approvals/page.tsx`: route old approvals through the guarded hub.
- `src/app/employee/payroll/payments/page.tsx`: guard the legacy payment path before redirecting internally.
- `src/app/employee/opportunities/page.tsx` and `[id]/page.tsx`: retire employee recruitment views.
- `src/components/payroll-stage-review.tsx`: assigned payroll review with accessible decision dialog and loading/empty/error/success states.
- `src/components/employee-leave-approvals.tsx`: direct-report leave review with decision dialog and response states.
- `src/app/api/employee/payroll/review/route.ts`: reject unassigned access.
- `src/app/api/employee/manager/leave/route.ts`: direct-report responsibility, self-review restriction and body checks.
- `src/app/api/payroll/approve/route.ts`: malformed decision-body validation.
- `src/lib/route-metadata.ts`: approval-page titles.
- `package.json` and `scripts/run-integration-tests.mjs`: unified integration test command.
- `scripts/phase2-browser-suite.mjs` and `scripts/verify-collaboration.mjs`: reuse the isolated single-session database adapter and test removal of employee recruitment and explicitly opened cookie preferences.
- `scripts/consolidated-browser-suite.mjs`, `scripts/verify-consolidated-workflows.mjs`, `scripts/pglite-pool-preload.cjs`: disposable browser verification of the changed flows.
- `tests/aerochat-delivery.integration.mjs`, `tests/employee-approval-access.integration.mjs`, `tests/employee-leave-approval.integration.mjs`: replay, responsibility and tenant-isolation regressions.
- `tests/ai-api.integration.mjs`: current provider failure tests.

## Remaining requirements from the full handoff

- The full ordered applicant journey is not implemented: verified identity/phone ownership, authorised NIN provider, CV extraction/correction, separate general and job-specific assessments, configurable 85% qualification, accommodations and review/appeal workflow.
- Identity verification and SMS providers are not configured. Do not label NIN or phone numbers verified without a real successful provider result. Do not substitute possession of NIN for proof of identity.
- Interview scheduling/meeting controls, human feedback and hire-to-employee activation need a complete end-to-end acceptance test against configured providers.
- Current leave calculations are annual allowance minus distinct approved weekdays; accrual, carryover, holidays and configurable workweeks remain outstanding.
- Attendance policies/corrections/overtime, complete probation/performance automation, onboarding, learning, assets, projects/workflows, all notifications and reports still need full acceptance against the handoff.
- Every route/role/device combination, Lighthouse >=90 and all requested accessibility/security/data-integrity checks have not been completed.
- No claim is made that this checkpoint has been merged, deployed or verified in production.

## Manual release acceptance checklist

- Ordinary employee cannot see or open Recruitment, payroll processing or unassigned approvals.
- Assigned manager sees only own direct reports, cannot approve self or another tenant, and review cannot be replayed.
- Assigned payroll reviewer sees own company's current stage only; only CEO assignment opens payment authorisation.
- A chat message appears for sender and recipient; retrying a delivery identifier produces one stored message; different text conflicts.
- Check changed views at 360, 768 and 1280 pixels, keyboard operation, visible focus and axe critical/serious findings.
- Complete the outstanding recruitment, attendance, leave, payroll, onboarding and provider acceptance tests before one combined production release.

## Verified checkpoint results

- `npm run lint`: passed, zero ESLint warnings/errors.
- `npm test`: 56 tests passed.
- `npm run test:integration`: all 13 suites passed.
- `npm run build -- --webpack`: passed production compilation, type validation and prerendering.
- `npx tsc --noEmit`: passed.
- `npm run test:consolidated:browser`: passed against disposable localhost database. Verified actual HTTP 403 access denials, assigned approval visibility, persisted manager decision, 360/768/1280 layouts, no critical/serious axe issues on the approvals view, two-session chat delivery and one stored row on retry. No runtime errors were observed on the tested employee pages.
- These checks cover this checkpoint, not every feature in the full handoff. No production deploy was performed.

- `npm run test:collaboration:browser`: all 18 broader browser checks passed, including public/login axe checks, employer projects/meetings/documents, employee isolation/tasks, notice history, cookie privacy controls, expired birthday notices and applicant/admin API boundaries. This does not constitute a crawl of every application route.

## Additional changes prepared for the combined release

- `src/lib/leave-requests.ts`: shared validated leave submission, tenant-scoped employee locking, bounded date ranges and rejection of overlapping pending/approved requests.
- `src/app/api/leave/route.ts`: shared submission path; distinct pending annual days and available balance; preserves the legacy uncategorised warning.
- `src/app/api/employee/workspace/route.ts`: old submission endpoint delegates to the same category and overlap validation.
- `src/app/api/hr/requests/route.ts`: HR-created leave uses the same validation and overlap protection; null bodies return 400.
- `src/lib/request-decision.ts`: deduplicated employee notification inside the decision transaction.
- Manager and HR review APIs: commit decisions and notifications together; validate malformed bodies and require a rejection reason for HR decisions.
- `src/app/dashboard/employer/requests/page.tsx`: branded request inbox, pending-first status filter, employee/type search, decision dialog, reason for rejection and clear response states.
- `src/app/employee/leave/page.tsx`: allowance, approved, pending and available figures; accurate limits of existing policy calculations.
- `src/app/employee/page.tsx`: removes duplicate inline manager approvals and the unassigned manager API call; assigned approvals remain in My approvals.
- `package.json`: production build uses the verified webpack path explicitly.
- Leave integration tests and consolidated browser checks cover duplicate submission, legacy/HR endpoint parity, pending balances, HR fallback without a manager and decision notifications.

These changes need no new production migration and do not alter existing production records. Full accrual, carryover, configurable workweeks/holidays and the complete applicant identity/two-assessment journey remain outstanding. Release only after the updated checks pass; do not describe this as the entire handoff being complete.


## Final candidate validation — 31 October 2026

The renewed instruction authorises deployment of the tested combined changes. This report records candidate validation; production deployment is verified separately in Vercel. It does not certify completion of the entire handoff.

- Clean `npm run build`, lint, 56 unit tests, all 13 integration suites and `tsc --noEmit` passed.
- Targeted browser checks passed: actual 403 boundaries, assigned approvals, mobile layouts, concurrent leave submission (one 201 and one 409), pending/available balances, HR rejection, balance restoration, exactly one notification and two-session chat delivery.
- All 18 broader browser checks passed with disposable data.
- Final local Lighthouse performance: homepage 98, applicant sign-in 98, projects 100, meetings 98, documents 98, employee tasks 94. Accessibility and Best Practices are 100 across these six pages. Public-page SEO is 100.
- Private portal SEO is 69 because indexing is intentionally blocked by meta tags and robots.txt. The gate requires private pages to remain blocked, rather than requiring public indexing to raise their SEO score.
- `src/components/projects-workspace.tsx` reserves space for the loading status; the reproduced project layout shift fell from 0.184 to 0.018 in the measured run.
- `scripts/phase2-lighthouse.mjs` separates public SEO checks from private indexing assertions. Updated score and browser summaries are in `docs/phase2/evidence`.
- Credential-pattern scan found no OpenAI project keys or private-key PEMs in source, public assets or the built client assets. This is a scoped scan, not a certification of the entire repository history.
- No new database migration, production test records, bank transfers or destructive cleanup is required by this release.

## Post-deployment TLS correction

The combined release was merged as `3898b66934748c3034db3477b2f2179b22736d7f` and reached READY on the production domains. All 19 unauthenticated production HTTP checks passed. A subsequent deployment-scoped runtime scan found a PostgreSQL SSL-alias warning on Careers; it was a driver warning rather than a failed page.

- `src/lib/postgres-connection.ts` explicitly maps pg's current strict SSL aliases to `verify-full`; credentials, other parameters, local connections and explicit compatibility settings are preserved.
- `src/lib/employer-session.ts` applies this normalisation before creating the existing connection pool.
- `tests/postgres-connection.test.mjs` covers strict aliases, encoded credentials, unrelated parameters, idempotence and local/explicit configurations.
- Validation for the correction: clean build, lint, TypeScript, 58 unit tests, all 13 integration suites and the targeted browser suite passed. The browser checks again verified tenant/access boundaries, concurrent leave, balances, HR decisions, one notification and chat delivery.
- The correction needs no migration and changes no production business records. Its deployment and subsequent log scan are recorded in the follow-up pull request.

The final connection audit found two additional Pool constructors: applicant sessions and employer registration. Both now apply the same strict connection-string helper. The intermediate TLS deployment was cancelled before activation so the completed correction can deploy together. The existing combined UI/workflow release stays live during verification.
