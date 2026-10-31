# Interview scheduling, assessment review and hire activation

Baseline: production `b89e49dafad64aaef2ba82670ce2dc62e20ed80e` (PR 62). Work in progress until the PR records deployment verification.

## Audit and changes

| Finding | Change |
| --- | --- |
| Hiring created an employee record but did not queue activation | Enqueue a tenant-scoped activation job in the hiring transaction; already-activated accounts are skipped |
| Manual invites could create duplicates and reported an immediate send | Share a locked, deduplicated queue; return queued status, expose delivery status, retain explicit manual reissue |
| Provider timeout could leave uncertain delivery | Stable job-scoped token and provider idempotency key; restrict ambiguous retries to less than the provider’s 24-hour retention window |
| Activation token appeared in URL queries | New invitations use URL fragments, read only by the activation form; legacy query links remain accepted |
| Candidates could not select or reschedule an interview | Employer availability with assigned interviewer, candidate-owned booking, clash detection and revision checks |
| Old meeting links needed invalidation after changes | Reschedule/cancel revokes the previous room and joins; slots release safely; history is retained |
| No calendar download | Authorised ICS with stable UID, increasing sequence, UTC timestamps, escaped/folded text and cancellation status |
| Interview reminders lacked candidate delivery | Revision-scoped booking/change/reminder jobs; stale, ended and completed interviews are skipped |
| Starter questions could be published without accountable review | HR-only preview, answer-key/content review and notes before publication/new applications; this does not claim independent validation |

## Data and access

Migration 044 is additive: an availability table/indexes and three columns. No historical interview, employee, invitation, score or application is deleted or automatically marked reviewed. Existing applications retain their assessment snapshots. HR must review a legacy role’s question set before accepting new applications; ongoing applications continue to work.

Slots and email jobs are tenant-scoped. Applicants book only their own shortlisted applications; employees cannot use recruitment scheduling endpoints. HR assigns interviewers only from active employees in that tenant. One slot admits one application. Appointment updates are serialised using a tenant lock with consistent application lock order. Human review exceptions remain required below the qualifying threshold.

Activation tokens are HMAC-derived from the existing server encryption key and job/employee/tenant/email scope. Only their hashes enter invitations; no raw token enters queue payloads, responses or logs. Expiry is fixed to 48 hours from queue creation. Delivery retries stop after 23 hours, within Resend’s documented 24-hour idempotency window. Provider acceptance is not claimed as inbox delivery. Revoked/inactive or already-activated employee accounts cannot activate through old invitations.

Email and meeting configuration names are present in production. Values were not retrieved or printed. No live test emails or production test identities are created. Synthetic tests mock provider calls. Existing GitHub-authenticated collaboration scheduler runs background delivery; no manual production queue execution is part of verification.

## Calendar and availability semantics

HR publishes slots from 30 minutes to 90 days ahead, in durations of 15/30/45/60/90/120 minutes. Browsers show local times; UTC values are stored. Candidate self-service changes close 30 minutes before the interview; HR handles later changes. Completed interviews require HR review before another round. Calendar files are downloadable imports, not two-way Google/Microsoft OAuth sync. Matching UID/sequence supports calendar updates; whether a specific client updates on re-import depends on that client.

Expired availability/reminders leave active views, while business/audit records remain. No recording/transcription is enabled or represented as verified by these changes. Existing secure Aerotech meeting controls are retained.

## Honest remaining dependencies

- Live phone ownership and authorised NIN identity verification need a configured provider; no such provider credentials were found. NIN collection is not enabled and self-reported information is not marked verified.
- Independent assessment validation requires suitable licensed content or professional validation; HR review is distinct from certification. Starter banks remain labelled accordingly.
- Two-way calendar OAuth integration and real multi-device audio/video/inbox-delivery acceptance are not claimed by mocked tests.

## Verification and manual QA

Run build, lint, tsc, unit/integration suites, malformed-input probes and disposable browser-to-database checks. Confirm the exact merged commit and live domain, role/next redirects, API denials and deployment-scoped runtime logs.

Manual steps: HR previews/reviews questions; publishes slots; candidate books, downloads calendar and reschedules; old room must deny access; another candidate cannot book the taken slot. Cancel and verify cancellation calendar/revision. Record hire, inspect queued activation, activate only from the invitation, verify correct employee portal/tenant and existing onboarding. Retry requests and failed delivery without creating duplicate identities, employee records or notifications.
