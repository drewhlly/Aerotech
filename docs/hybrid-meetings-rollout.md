# Aerotech hybrid meetings rollout — 19 November 2026

## Findings and implementation

The stack is Next.js App Router/React 19/TypeScript, native `pg` and checksum-ledger SQL migrations (no ORM). The previous integration was custom Jitsi/8x8 JaaS, not an identified AI agent SDK. Existing portal/ATS routes are preserved.

Migration **048** is unchanged. It renames `meet_rooms` to `meetings`; adds/backfills non-null employer `host_id`, video/audio type, provider/opaque-room/generation metadata; creates the updatable `meet_rooms` compatibility view; adds typed employer/employee/applicant/pending-email `meeting_participants` with role, invitation/join times and generation admission; backfills identities; adds old deployment-wide `meeting_usage_reservations` and room-generation history; installs compatibility identity/invitation-job triggers. It does not provide hybrid mode, external URLs, plan entitlements or actual tenant usage.

Follow-up **049** adds `mode` (`external_link`/`built_in`), `external_url`, an HTTPS shape constraint, audio default for new routine meetings, `meeting_plan_limits`, `employer_meeting_usage`, `employer_meeting_reservations`, provider-duration segments and reconciliation timestamps, generation-specific call type, and external URLs for interview slots. Existing meetings retain built-in mode; they cannot be converted into external calls without a valid link. The compatibility view includes the new fields. Legacy database writers default built-in; every server creation path now checks entitlements or an external link. New scheduling UI defaults external links.

External links are validated server-side with URL parsing, HTTPS, no userinfo/custom ports, exact/dot-boundary hostname allowlist and a non-empty meeting path. The server never fetches the pasted URL or creates a Daily room for it. The invited user confirms inside Aerotech, then opens the provider in a new tab. Aerotech enforces invitation/time/tenant/cancellation access to that link; the external provider controls its own lobby, recording and access. The host must configure those protections there; a copied external link can outlive Aerotech cancellation.

Built-in creation/admission checks the actual employer's active subscription, enabled plan, paid-until time, provider configuration, participant cap and monthly quota. UI displays actual/reserved use, warns at 80% actual use and offers external links/upgrades at exhaustion. Admission reserves the maximum call window to prevent concurrent overspend; reservations are not represented as actual usage. The existing deployment-wide 8,000-minute admission ceiling remains an additional operator safeguard for the shared Daily account. It can constrain admissions even when one employer has unused plan minutes; do not sell unlimited usage on the assumption that Daily's free allowance is per employer.

Only server-authenticated Daily analytics can create actual usage: ended provider sessions' participant join times and duration, split across UTC months. Reconciliation is idempotent per provider session/participant. Every participant contributes to its room owner's quota, including unknown IDs, and audio minutes are a subset of total participant-minutes. A browser Leave button, token issuance and client timestamps are not usage evidence. The existing collaboration cron polls analytics and continues external invitation delivery if metering fails; failures surface in its status. Reservations stay through scheduled expiry plus 24 hours for reporting lag; polling continues seven days. Delayed/corrected provider reports beyond that window need operator reconciliation. This is a quota meter, not a claim of exact Daily invoice rounding.

## Higher plans

| Plan | External links | Built-in monthly participant-minutes | Built-in participant cap |
|---|---|---:|---:|
| Basic | Yes | Off | — |
| Premium (`professional`) | Yes | 500 | 8 |
| Business | Yes | 2,000 | 16 |
| Enterprise | Yes | 5,000 | 32 |

These limits are editable in `meeting_plan_limits` via a reviewed migration/admin operation. No existing subscription prices were changed. Minutes reset by UTC calendar month and do not roll over. Enterprise receives the largest included quota and room size; any larger allowance should be a costed agreement. Daily's allowance is shared by the account across all employers; overage can be billable. Keep the deployment ceiling and monitor actual provider usage.

## Environment matrix: observed, not assumed

| Variable | Vercel Production | Preview | Development | Cloudflare production `aerotech` | CF staging `aerotech-staging` |
|---|---|---|---|---|---|
| `DAILY_API_KEY` | Missing | Missing | Missing | Missing | Missing |
| `DAILY_DOMAIN` | Missing | Missing | Missing | Missing | Missing |
| `MEETING_BUILT_IN_ENABLED` | Missing → false | Missing → false | Missing → false | Missing → false | Missing → false |
| `DATABASE_URL` | Present | Present in shared Production/Preview metadata; isolation unverified | Not observed | Missing | Present |
| `DOCUMENT_ENCRYPTION_KEY` | Present | Missing | Missing | Missing | Missing |
| `RESEND_API_KEY` | Present | Missing | Missing | Missing | Missing |
| `INVITATION_FROM_EMAIL`, `APP_BASE_URL` | Present | Missing | Missing | Missing | Missing |
| `CRON_SECRET` | Present | Missing | Missing | Missing | Missing |

Each full application environment needs its own database/session/invitation/email configuration; never copy production personal data or live payment credentials into preview. External mode needs none of the Daily values. Built-in mode needs both Daily values and `MEETING_BUILT_IN_ENABLED=true` in **every** enabled deployment scope. Missing/invalid Daily configuration emits a constant, secret-free startup error and disables just built-in calls. It does not crash external mode or the rest of the app. Unauthenticated requests remain denied independently.

Wrangler is installed but unauthenticated; Vercel CLI credentials are unavailable. No login bypass or connector write was used to set Daily secrets. `gh` is also unauthenticated, and the connected GitHub app excludes secrets APIs.

### Exact dashboard setup

1. Create Aerotech's Daily account at https://dashboard.daily.co/signup, select its subdomain, inspect current allowances/billing, and obtain its server API key from Developers/API keys. Participants use Aerotech accounts and need no Daily accounts. Never paste the key into chat.
2. Vercel → Aerotech → Settings → Environment Variables: add sensitive **`DAILY_API_KEY`**, server **`DAILY_DOMAIN`** (hostname only, e.g. `your-team.daily.co`), and **`MEETING_BUILT_IN_ENABLED=true`**. Select Production and Preview separately; also Development if used. Prefer an isolated Daily test account/configuration for preview. Configure non-production auth/encryption/Resend values there. Redeploy each scope after saving. If Daily is not ready, leave the switch false; external links still work.
3. Cloudflare → Workers & Pages → `aerotech` → Settings → Variables and Secrets: add `DAILY_API_KEY` and `DAILY_DOMAIN` as encrypted secrets, plus the explicit enable switch and safe quota/domain settings. Repeat for `aerotech-staging` and any separate preview Worker. Bind a separate validation database and test email/auth secrets for staging. There are no Pages projects in the inspected account. The inspected production Worker currently has only assets; it is not verified as the running full Aerotech application.
4. Keep `MEETING_EXTERNAL_ALLOWED_DOMAINS=meet.google.com,zoom.us,teams.microsoft.com,teams.live.com`, `MEETING_MAX_PARTICIPANTS=32`, `MEETING_TOKEN_TTL_SECONDS=300`. The existing `MEETING_MONTHLY_BUDGET_MINUTES=8000` is shared-account reservation protection, not each employer's quota. Do not increase it without assessing account billing.
5. Install a five-minute scheduler for `/api/cron/collaboration`. The existing GitHub OIDC scheduler currently targets Vercel; Cloudflare needs a verified scheduler with `CRON_SECRET` bearer auth, or a separately reviewed endpoint/audience update. A successful Worker build does not install a scheduler.

### Daily variable read inventory

- `src/lib/meeting-provider.ts`: server domain validation, REST key authentication and room URLs.
- `src/lib/meeting-runtime-config.ts`: server enable/configuration validation, invoked by `src/instrumentation.ts` and server entitlements/diagnostics.
- `next.config.ts`: Daily **domain only** for CSP/Permissions Policy. The allowed domain and call URL are necessarily visible to the browser; the API key is not.
- Diagnostics now calls the configuration helper instead of reading the key independently.

A synthetic random-key build check (`scripts/verify-meeting-client-secrets.mjs`) builds without database/email/payment/auth production secrets, then scans client assets for the canary and `DAILY_API_KEY`. It never prints the canary. Build results are recorded in the final PR evidence; no real key was available or used.

## Neon staging and production order

Rollback branch `br-sparkling-wave-b80z0gvo` (`meetings-hybrid-rollback-20261119`) preserves the staging parent before changes. Validation branch `br-silent-rice-b8iqv9ey` (`meetings-hybrid-validation-20261119`) is isolated in project `spring-fire-35269323`, database `aerotech_staging`. Both 048/049 were applied there transactionally with checksum-ledger entries, then replayed safely (no re-execution). SQL create/read/cancel and host identity checks passed. QA metadata uses `.invalid` addresses; no email was delivered.

A local application attempt against that branch failed because its Neon hostname could not resolve (`EAI_AGAIN`). Connected Neon SQL succeeded. **This is not a completed app-on-Neon runtime acceptance.** Portal routes are exercised separately by isolated integration/browser fixtures. Finish app-on-staging connectivity and acceptance before production migration.

Production was not migrated. Attempts to create a new production backup were blocked by snapshot and branch limits. The only listed production snapshot was from 29 October, which is not a fresh rollback point. Resolve capacity/create a verified fresh rollback branch or snapshot first, without deleting anything by assumption.

After staging app acceptance **and explicit owner production go-ahead**, the order is:

```bash
# Node 24; checkout the exact reviewed release commit, install locked dependencies.
npm ci --no-audit --no-fund
# Set DATABASE_URL through a private env/secret mechanism, never echo it.
# 1. DATABASE_URL must be validation branch br-silent-rice-b8iqv9ey / aerotech_staging:
npm run db:migrate
npm run db:migrate   # checksum-ledger no-op verifies replay
# Run actual app create/read/cancel, invitation, external and paid built-in acceptance.
# 2. Only after backup + staging acceptance + explicit approval, set DATABASE_URL
# to production project polished-cloud-66634472 / br-empty-base-b84a9xdp / neondb:
npm run db:migrate   # applies 048 then 049 in one locked transaction
# 3. Deploy reviewed application, test external mode first, enable Daily after acceptance.
```

Raw SQL 048/049 is not independently idempotent. The migration runner is tracked, checksum-validated and transaction/advisory-lock protected. Never baseline a populated production database blindly; never modify either applied migration. Roll back the application with the expanded schema/view retained, disable built-in mode, and keep external meetings working. A data rollback restores the pre-change branch/snapshot into a **new** branch, verifies it, then switches the connection after approval; do not drop tables or overwrite production automatically. Any data entered after the rollback point needs reconciliation.

## Vercel preview provisioning

Deployment `dpl_6gabPoaGv4PFKzoChX49djNvD1cW` reports `BUILD_FAILED / Resource provisioning failed` and has **zero build events**. The specific failing resource trace is not exposed by the connected API. Neon integration is installed on its free plan, reports selected-project configuration with an empty project list, and the marketplace-linked project rejects new branches with `branches limit exceeded`. This is a confirmed capacity blocker consistent with provisioning failure, not proof that it is the only failing resource. Production backup creation also hit `snapshots limit exceeded`.

No required Daily key is needed to build or use external mode. `npm ci` completed from the lockfile, Node is 24.x and framework preset is Next.js. Production build is `npm run build` → `next build --webpack`, with face-model preparation; it does not run migrations. Existing pg/session routes remain Node runtime and the Worker uses OpenNext/nodejs_compat. Case/import/type issues are checked by Linux CI. Builds and live resource provisioning are separate gates.

Owner dashboard changes/checks:

1. Vercel → Aerotech → Settings → Build and Deployment: Next.js preset, repository root, Node 24.x, install `npm ci --no-audit --no-fund`, build `npm run build`, default output directory. No migration command in install/build.
2. Neon: upgrade capacity or explicitly approve one named obsolete preview branch for deletion. Do not delete main or active branches. Create a fresh production rollback point before migration.
3. Vercel → Storage/Marketplace → Neon → connected Aerotech resource: check the project association and Preview branch provisioning. Set Preview `DATABASE_URL` to its own branch (never reuse the production default). The observed shared variable entry alone does not establish safe per-deployment isolation. Manual alternative: disconnect **preview provisioning only** after confirming production remains associated, assign the isolated validation branch URL in Preview scope, and redeploy. Do not sever production storage by assumption.
4. If still failing, open Deployments → failed Preview → resource/provisioning details (and its linked Neon resource event). Copy the failing resource name/ID, integration error code/message and deployment ID, with all connection strings/tokens redacted. Build-log output is empty; request this trace from Vercel support if the dashboard does not show it.
5. Retry only after a capacity/configuration change; require Vercel **READY** and authenticated runtime acceptance. This work does not declare the Vercel platform failure resolved merely because source builds pass.

## Email/DNS observation

Public DNS on 19 November has SPF at `aerotechhr.app` and `send.aerotechhr.app`, Resend DKIM at `resend._domainkey.aerotechhr.app`, and DMARC at `_dmarc.aerotechhr.app` with `p=none` (monitoring). No record is missing by existence. This does not prove that the current Resend account is verified or that messages pass alignment/deliver to Inbox. Do not invent a DKIM public key or create a second SPF record. In Resend Domains compare the exact verified-domain DKIM/return-path SPF/MX records with DNS; add only the values shown there if any differ. Consider DMARC quarantine/reject after confirming every legitimate sender aligns.

No real invitation/reminder was sent by this branch: isolated preview Resend credentials and a deployed staging mail worker are unavailable. The manual script below is required; do not copy live payment keys or production personal data into preview to get a green test.

## Two-device script — owner to run

1. Host signs into employer portal on laptop; invited employee/applicant signs into their own portal on a phone. Schedule a two-minute-observation built-in **video** call (form duration minimum 15 minutes). Expected: private Aerotech invitation, correct role, no Daily account required.
2. Phone opens its secure invitation and checks devices after tapping. Expected: clear permission help if denied, then working front camera/microphone after permission.
3. Guest selects Join. Expected: waits until host admits; a non-invited account and another employer are denied.
4. Host admits; test two-way sound/video, mute, camera, raise hand/chat and desktop screen share. Expected: controls work; no recording/transcription enabled.
5. Both leave. Wait for provider analytics and the five-minute reconciliation worker. Expected: actual participant-minutes increase only for the host's employer; retrying the worker does not double-count. Scheduled reservations remain separately labelled until released.
6. Repeat as audio-only. Expected: camera stays off and cannot send video; actual audio minutes also increase as a subset of participant-minutes.
7. Cancel a separate meeting, then try its link; try an expired meeting. Expected: no join token/link issued; clear cancelled/expired state. At 80% actual quota a warning appears; at 100% a new built-in call is blocked while an external call remains available.
8. Repeat with an external Google Meet/Zoom/Teams link. Expected: opens at the host's provider after Aerotech invitation confirmation; no Daily room or Aerotech usage entry. The host's external-provider lobby protects the call.

## Real email receipt script — owner to run

1. In staging use a verified Resend sender/test key and your real inbox as the only invited recipient. Schedule a meeting about 20 minutes ahead, choosing the host's real timezone (e.g. Africa/Lagos).
2. Run/observe the intended deployment's collaboration scheduler. Expected: one invitation with title, local time and timezone, secure Aerotech join link and `.ics` attachment. Import calendar: time converts correctly.
3. Check Inbox and Spam, then message headers: SPF, DKIM and DMARC alignment should pass for the actual sender. Record delivery/provider message ID and receipt time without copying credentials.
4. At approximately 15 minutes before start, run/observe scheduler. Expected: one reminder with the same correct meeting/link/calendar information; retrying does not duplicate delivery.
5. Reschedule/cancel and verify the new calendar revision/cancellation and revoked old generation. Keep real-receipt and Spam results marked unverified until observed.

See [full-history audit](./hybrid-meetings-secret-audit.md) for findings, credential rotation and the unapproved history-rewrite plan. New application dependencies for this follow-up: **none**. Gitleaks is a pinned, isolated audit tool, not an application dependency.

## Verification evidence

- Clean locked install: passed, Node 24.
- Unit tests: 74 passed. Full integration suites: 34 passed, including attendance/payroll/auth/recruitment and hybrid role/quota/metering/tenant cases.
- Lint and type-check: passed. Production Next build without database/email/payment/auth production secrets: passed. Synthetic Daily key and its environment-variable name absent from 386 client artifacts.
- OpenNext Cloudflare bundle: passed locally; provider-account/runtime connectivity is a separate gate.
- Responsive meeting dashboard/prejoin fixture checks at 360/768/1024/1440 across all portals, audio/no-camera, preview cleanup, permission denial, waiting lobby and external-link opening: passed in run 44537642366 before its Cloudflare step. Physical devices/real media are not implied.
- Neon validation branch: migrations + replay and SQL create/read/cancel passed; actual app connection failed DNS and remains unverified.
- Real Resend receipt/spam/headers and real Daily analytics remain unverified; public DNS records were inspected.
- Full-history security audit: completed, 26 candidates including generated build credentials; **not clean**. The finding job intentionally fails and has not been waived.

Later narrow mode-conversion/rejected-invitation fixes have a passing dedicated hybrid integration check and are subject to the PR’s final checks. No production migration or live cutover is declared.
