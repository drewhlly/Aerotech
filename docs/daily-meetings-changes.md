# Meetings file inventory

Based on the change from main `99f6f7d2`; validation and limitations are in daily-meetings.md and the acceptance/security notes.

| File | Change | Purpose |
|---|---|---|
| `.env.example` | Updated | Daily secrets and safe configurable application limits; remove old provider variables. |
| `.github/workflows/cloudflare-staging-deploy.yml` | Updated | Build, responsive/browser evidence or isolated Cloudflare staging workflow. |
| `.github/workflows/meetings.yml` | Added | Build, responsive/browser evidence or isolated Cloudflare staging workflow. |
| `.github/workflows/signed-in-verification.yml` | Updated | Build, responsive/browser evidence or isolated Cloudflare staging workflow. |
| `.gitignore` | Updated | Exclude generated adapter/build artifacts from Git, lint or type discovery. |
| `database/048_daily_meetings.sql` | Added | Compatible canonical meeting tables, typed participant backfill, admission generations and budget/teardown metadata. |
| `docs/aerotech-meet-deployment.md` | Removed | Remove superseded provider guide. |
| `docs/aerotech-meet-jaas.md` | Removed | Remove superseded provider guide. |
| `docs/daily-meetings-acceptance.md` | Added | Setup, acceptance/security scope, or corrected environment documentation. |
| `docs/daily-meetings-security-audit.md` | Added | Setup, acceptance/security scope, or corrected environment documentation. |
| `docs/daily-meetings.md` | Added | Setup, acceptance/security scope, or corrected environment documentation. |
| `docs/environment-inventory.md` | Updated | Setup, acceptance/security scope, or corrected environment documentation. |
| `docs/phase2/review.md` | Updated | Setup, acceptance/security scope, or corrected environment documentation. |
| `eslint.config.mjs` | Updated | Exclude generated adapter/build artifacts from Git, lint or type discovery. |
| `next.config.ts` | Updated | Daily-specific CSP and camera/microphone/display-capture permissions. |
| `open-next.config.ts` | Added | Cloudflare adapter configuration. |
| `package-lock.json` | Updated | Exact dependency graph for reproducible installs. |
| `package.json` | Updated | Daily runtime dependency, OpenNext/Wrangler build tools and compatible pinned Next version. |
| `scripts/migrate.mjs` | Updated | Register SQL migration 048 in the existing checksum ledger. |
| `scripts/verify-meetings-ui.mjs` | Added | Synthetic authenticated routes/UI verification; remove obsolete Jitsi fixture assumptions. |
| `scripts/verify-route-crawl.mjs` | Updated | Synthetic authenticated routes/UI verification; remove obsolete Jitsi fixture assumptions. |
| `scripts/verify-signed-in.mjs` | Updated | Synthetic authenticated routes/UI verification; remove obsolete Jitsi fixture assumptions. |
| `src/app/api/collaboration/notifications/route.ts` | Updated | Authenticated recipient-scoped meeting notices, including applicant inbox. |
| `src/app/api/meet/[id]/calendar/route.ts` | Added | Permission-checked meeting API; preserve existing portal URLs. |
| `src/app/api/meet/[id]/details/route.ts` | Updated | Permission-checked meeting API; preserve existing portal URLs. |
| `src/app/api/meet/[id]/join/route.ts` | Updated | Permission-checked meeting API; preserve existing portal URLs. |
| `src/app/api/meet/[id]/lobby/route.ts` | Added | Permission-checked meeting API; preserve existing portal URLs. |
| `src/app/api/meet/applications/route.ts` | Added | Permission-checked meeting API; preserve existing portal URLs. |
| `src/app/api/meet/groups/route.ts` | Updated | Permission-checked meeting API; preserve existing portal URLs. |
| `src/app/api/meet/route.ts` | Updated | Permission-checked meeting API; preserve existing portal URLs. |
| `src/app/api/meet/selection/route.ts` | Updated | Permission-checked meeting API; preserve existing portal URLs. |
| `src/app/api/support-console/tickets/[id]/diagnostics/route.ts` | Updated | Report Daily configuration readiness without exposing keys. |
| `src/app/applicant/notifications/page.tsx` | Added | Authenticated recipient-scoped meeting notices, including applicant inbox. |
| `src/app/globals.css` | Updated | Responsive meeting/prejoin/lobby/form/focus styling. |
| `src/components/meeting-list.tsx` | Updated | Video/audio, instant/scheduled, interview selector, calendar, reschedule/cancel and dashboard tabs. |
| `src/components/meeting-room.tsx` | Updated | Device preflight, permission help, host lobby, branded call/timer, media cleanup and private SDK tokens. |
| `src/components/people-picker.tsx` | Updated | Accessible empty option in existing participant selector. |
| `src/lib/collaboration-worker.ts` | Updated | Independent durable email and in-app notices, reminders, calendars and provider teardown retries. |
| `src/lib/face-camera.ts` | Updated | Preserve browser model URL while avoiding erroneous Cloudflare server bundler resolution. |
| `src/lib/meeting-access.ts` | Added | Authenticated identities, tenant and invitation checks, bounded same-origin JSON, admission and reservation enforcement. |
| `src/lib/meeting-embed.ts` | Added | Lazy Daily Prebuilt browser adapter with immediate media-cleanup handle. |
| `src/lib/meeting-guest.ts` | Removed | Removed legacy unauthenticated guest-email bearer implementation. |
| `src/lib/meeting-invitations.ts` | Added | Opaque generation-scoped mailbox proof; no email/provider token in links. |
| `src/lib/meeting-policy.ts` | Added | UTC scheduling, TTL, limits, cross-month budgets and escaped/folded ICS generation. |
| `src/lib/meeting-provider.ts` | Updated | Portable Daily createRoom/createToken/endRoom implementation; replaces Jitsi/JaaS JWT signing. |
| `src/lib/meeting-rate.ts` | Added | Transactional per-employer creation limit shared by meetings and ATS. |
| `src/lib/meeting-service.ts` | Updated | Validated scheduling and generation-specific provider teardown. |
| `src/lib/recruitment-interviews.ts` | Updated | Retain application links while sharing meeting creation rate limits. |
| `tests/collaboration-api.integration.mjs` | Updated | Disposable provider/SQL fixtures and regression assertions; no real media or credentials. |
| `tests/collaboration-db.integration.mjs` | Updated | Disposable provider/SQL fixtures and regression assertions; no real media or credentials. |
| `tests/completion.test.mjs` | Updated | Disposable provider/SQL fixtures and regression assertions; no real media or credentials. |
| `tests/helpers/daily-fixture.mjs` | Added | Disposable provider/SQL fixtures and regression assertions; no real media or credentials. |
| `tests/meeting-access.integration.mjs` | Added | Disposable provider/SQL fixtures and regression assertions; no real media or credentials. |
| `tests/meeting-provider.test.mjs` | Updated | Disposable provider/SQL fixtures and regression assertions; no real media or credentials. |
| `tsconfig.json` | Updated | Exclude generated adapter/build artifacts from Git, lint or type discovery. |
| `wrangler.jsonc` | Added | OpenNext staging Worker bindings and nodejs_compat; no API keys. |
