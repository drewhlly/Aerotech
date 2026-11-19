# Aerotech embedded meetings

## Discovery and replacement

The application is Next.js App Router / React 19 / TypeScript, native `pg`, and checksum-ledger SQL migrations, not an ORM. Meetings previously used a hand-written Jitsi iframe loader with 8x8 JaaS RSA JWTs or self-hosted HMAC JWTs. No separate meetings AI agent/SDK was found. `meeting-provider.ts`, the join handler, client room and CSP contained the provider coupling. Existing meeting IDs, ATS interview associations, employee/group invitations, calendar delivery and worker lifecycle are preserved. Legacy meeting-note/action-content writes are retired with 410 responses; historical columns are retained without destructive deletion. Projects remains available for manually managed action items.

The replacement uses `@daily-co/daily-js` 0.95.0, lazy-loaded only on Join, with Daily Prebuilt. `MeetingProvider` in `src/lib/meeting-provider.ts` defines `createRoom`, `createToken`, `endRoom`; it uses fetch/Web Crypto-compatible values and a fixed Daily API origin. Portal UI uses the `EmbeddedCall` adapter in `meeting-embed.ts`. A future LiveKit/Jitsi adapter implements the server contract and the small embedded-call adapter, then changes provider selection; scheduling, invitations, authorization, dashboards and the portal UI stay unchanged. No LiveKit/Jitsi implementation is claimed by this release.

## Database and routes

Migration `048_daily_meetings.sql` renames the existing base table to `meetings`, adds host/type/provider metadata, and creates an automatically updatable `meet_rooms` compatibility view so old routes and interview/worker queries continue working. Existing foreign keys follow the renamed table. `meeting_participants` contains typed employer/employee/applicant identities, host/participant role, invitation/join times, admission generation and status. Email invitations remain unclaimed until authenticated mailbox proof; `user_id` is nullable only for that pending-email state. `meeting_provider_rooms` retains generation-specific opaque provider room names so cancellation retries can end the correct old room. `meeting_usage_reservations` holds metadata-only budget reservations.

Use the existing migration runner: `npm run db:migrate`. Migration 047 (face vectors) remains separately opt-in; meetings does not require pgvector. Test migration 048 against a staging copy first; verify the ledger/checksum, `meetings` base table, `meet_rooms` view and participant backfill before enabling the release. Do not edit/replay old migrations or blindly baseline a database. Roll back application code with the compatibility view kept; do not drop meeting or participant history.

Existing pages remain `/dashboard/employer/meet`, `/employee/meet`, `/applicant/meet`, and their `/:id` call pages. Generic `/meet` URLs continue redirecting into the current portal. Recruitment scheduling still links the exact application. New endpoints: `/:id/lobby`, `/:id/calendar`, and `/api/meet/applications`. GET `/:id/join` returns authorized metadata only; POST mints a provider token after admission. Creation/reschedule/cancel and lobby writes validate same-origin JSON.

Employers/HR using the existing employer portal can host. Employee job titles do not silently grant host privileges; employees and applicants are invitation-only. Host admission is enforced by Aerotech before minting a token. Daily public knocking is disabled, so a leaked private room URL cannot request access outside Aerotech. Rooms have random names, unique user IDs, private access, scheduled opening/expiry and forced ejection at room expiry. Per-user tokens expire after at most five minutes by default (admission TTL); already-joined calls remain bounded by room expiry. Cancellation revokes server access immediately, attempts provider eject/delete and queues durable retries. A provider outage can delay teardown; token/room expiry and periodic client checks provide additional bounds.

## Configuration (server secrets only)

| Variable | Default / value | Purpose |
|---|---|---|
| `MEETING_PROVIDER` | `daily` | Only Daily implemented; unsupported providers fail closed |
| `DAILY_API_KEY` | Required secret | Daily REST API authentication; never `NEXT_PUBLIC_*` |
| `DAILY_DOMAIN` | Required, e.g. `your-team.daily.co` | Exact Daily subdomain; no scheme/path |
| `MEETING_MONTHLY_BUDGET_MINUTES` | `8000` | Conservative application admission reservation ceiling |
| `MEETING_MAX_PARTICIPANTS` | `8` | Application room capacity, includes host |
| `MEETING_TOKEN_TTL_SECONDS` | `300` | 60–600s token admission lifetime |
| `DOCUMENT_ENCRYPTION_KEY` | Existing 32-byte base64 secret | Separate scoped HMAC mailbox invitations; keep existing value |
| `RESEND_API_KEY`, `INVITATION_FROM_EMAIL`, `APP_BASE_URL` | Existing values | Calendar email delivery and absolute Aerotech links |

No face/attendance/payroll secrets are changed. Old provider variables removed from source/config templates: Jitsi domain/app/secret/sub and JaaS app/key/private key. Stored deployment secrets must be removed at the Daily cutover, after confirming that no old deployment/active call still needs them. Never print keys or rewrite public Git history as a substitute for rotation. See the security audit note for actual scan coverage and findings.

### Create the Daily account and set hosting secrets (no participant accounts)

1. Open https://dashboard.daily.co/signup and create Aerotech's organization account. Choose its Daily subdomain. Confirm the account's current allowances and billing settings; adding a payment card can enable billable overage. Do not enable recording or transcription products.
2. In the Daily dashboard's Developers/API keys area, obtain the organization API key. If navigation differs, use https://docs.daily.co/reference/rest-api for the current authentication guide. The key belongs in hosting secret settings, never chat, a browser form, Git, or a public environment variable.
3. Vercel → Aerotech project → Settings → Environment Variables: add `DAILY_API_KEY` as Sensitive for the intended Production/Preview environment and `DAILY_DOMAIN` as a regular server value. Add the budget/type values from the table. Keep existing database, encryption and Resend values. Redeploy to apply changes. Use isolated Daily/database configuration for previews.
4. Cloudflare → Workers & Pages → the intended Aerotech Worker (existing staging name `aerotech-staging`) → Settings → Variables and Secrets: add encrypted secret `DAILY_API_KEY`, regular `DAILY_DOMAIN` and the budget settings. Keep database/session/Resend secrets present. Save/deploy. The equivalent CLI is `npx wrangler secret put DAILY_API_KEY --name aerotech-staging`; paste only into its interactive secret prompt.
5. Run the two-device acceptance script and verify one actual email/reminder before switching live meetings. Then remove retired provider secrets from both hosting environments and rotate any key ever exposed. Do not delete unrelated credentials or branches.

## Free allowance and budget limits

Verified against official documentation on **19 November 2026**:
- https://www.daily.co/pricing/video-sdk/ advertises 10,000 free participant-minutes per month. A participant minute is one participant for one minute; four participants for 30 minutes consume 120 participant-minutes.
- After the free allowance, its first listed tier is $0.004 per video participant-minute and $0.00099 per audio-only participant-minute. Daily Video is pay-as-you-go and its pricing FAQ explicitly says there is no hard cap that stops calls after the free allowance.
- Account room/concurrency limits, pricing and eligibility can change. Check the actual account/dashboard; do not rely on old blog posts about historical five-room plans. No provider minute allowance is hard-coded into room logic.

Aerotech reserves the entire possible opening window (15 minutes early through duration + five minutes) for all invited identities, with at least two places, before creating a room. Cross-month reservations are charged conservatively to each UTC month. Rejoins reuse the reservation; reschedules make a new generation and do not refund old reservations. A global database lock serializes the budget across all Aerotech tenants sharing this database. Once the configured ceiling is reserved, new room admission is blocked with a helpful allowance message. Existing scheduled metadata remains available.

**This is not an account-level billing guarantee.** Other Daily apps, API keys, direct room changes, a mismatched database or a changed provider allowance can still incur costs. Keep a dedicated Daily account, audit its usage, retain budget headroom and recheck the allowance. The app does not automatically upgrade plans or purchase minutes.

## Privacy, notifications and known limits

Recording, live captions/transcription, cloud recording, stored shared chat history and streaming permissions are off. Daily handles media and has its own processing/access-log policy: https://www.daily.co/security/data-protection/. Aerotech stores schedule, identities, delivery/admission/audit and budget metadata, not call audio/video/chat. Device preview tracks are stopped before calling or leaving. A participant can still use OS recording; software cannot promise to prevent that.

Invitations and 15-minute reminders use the existing durable worker and Resend, with an ICS attachment and local timezone plus UTC calendar timestamps. New in-app notices are scoped to the authenticated recipient; applicants have a meeting-notification inbox. Personal external invitations use an opaque, generation-scoped mailbox proof plus the matching Aerotech account; signing up with an email string alone is not enough. Provider tokens are sent in private/no-store POST responses, passed to SDK join options, never put in links, analytics or persistent storage. Pending mailbox proof may be kept only in tab sessionStorage during the sign-in round trip, then removed after joining.

Physical iPhone/Android media, real Daily room/token acceptance and actual Resend receipt are unverified until credentials and consenting test devices are available. Screen sharing depends on desktop browser/OS support. Hosted free-tier UI may display Daily branding. Browser/database tests and mocked provider responses do not establish actual media quality or deliverability.

## Vercel / Cloudflare builds

Meeting API routes explicitly use Node runtime because existing `pg` and session helpers use Node APIs. The provider adapter and invitation crypto use portable fetch/Web Crypto; they do not make the existing auth/database stack an Edge implementation.

OpenNext 1.20.17 + Wrangler 4.165.0 provide `npm run cf:build` / `cf:preview`; `wrangler.jsonc` enables `nodejs_compat` and asset/self-service bindings, logs without invocation URLs, and sampled traces. The adapter requires Next >=16.4.5, so Next is pinned to 16.4.6. Existing attendance model imports retain their browser URL behaviour while avoiding erroneous server bundler resolution. No Worker deploy or domain cutover is implied by a passing bundle build. Verify deployed runtime database/TLS connectivity and the actual account's Worker size/CPU limits separately. Do not place API keys in Wrangler vars/source.

Run `npm run lint`, `npm test`, `npm run test:integration`, `npm run build`, `npx tsc --noEmit`, `npm run cf:build`. The meeting CI workflow runs synthetic responsive/permission checks at 360/768/1024/1440px; the manual acceptance script records what still needs physical testing.
