# Communications and workspace refresh

Applicants can opt in to new-job alerts, follow selected companies or all companies, and change newsletter/product-email preferences. Existing users remain unsubscribed from optional emails until they opt in. A new publication is eligible only after the applicant's opt-in time and while the vacancy remains live. Published jobs older than seven days are not backfilled.

Employers, employees, and applicants have an Email preferences page. Essential employer maintenance/upgrade announcements are separate from marketing preferences. The super-admin Communications console schedules messages, cancels remaining sends, and reports queue/provider-acceptance counts. Planned work must be at least 24 hours after the scheduled notice. Large audiences need additional lead time; scheduling is not proof of inbox arrival. Newsletters and experience invitations require category opt-in. No campaigns are created or sent by this release.

A bounded delivery queue uses the existing authenticated five-minute scheduler and verified Resend sender. Every recipient/event pair is unique. Eligibility and opt-out are checked again before sending. Failed/ambiguous requests reuse provider idempotency keys and stop before the 24-hour provider window expires. Provider acceptance is distinct from delivery/opening. Administrators must review failed deliveries; this release does not process bounce/open webhooks.

The landing page has manually controlled applicant, employee, and employer slides, with no autoplay. Shared portal navigation, forms, tables, cards, account menus, and mobile menu positioning use the same blue visual system. Applicant account links now open the career profile. Bottom profile links close mobile navigation; account menus dismiss on outside click or Escape without a blur handler interrupting links.

Employee activation releases its transaction connection and starts the sign-in session before optional welcome-email scheduling. Failure to schedule a welcome email cannot prevent session creation.

## Verification

- Production build, TypeScript, repository lint, and 58 smoke tests pass.
- All 30 integration suites pass across the full run and focused reruns after fixing employee activation.
- New disposable-PostgreSQL communications suite covers opt-in, selected companies, no backfill, duplicates, essential notice recipients, minimum notice period, unsubscribe-before-dispatch, provider retry/idempotence and role isolation. Provider calls are mocked.
- HTTP tests against a production build with disposable accounts verify read/save across all three portals, correct profile links, cross-portal denial, and admin-only announcement access.
- A reusable browser test is in scripts/verify-communications-ui.mjs. Local visual/browser execution could not run because the browser binary download was unavailable. Live landing-page review follows deployment; full signed-in mobile interaction QA remains separate.

## Deployment

Apply additive database/045_communications.sql and record its exact checksum in schema_migrations before deploying. No changes to existing migrations. Keep existing Vercel project, domains, employer subscription policy, portal guards and other open PRs intact. No automatic enrolment or bulk message is part of deployment.
