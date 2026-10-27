# Aerotech Phase 2 — Implementation and verification

27 October 2026 · Review branch: `feat/phase2-collaboration`

The homepage and sign-in page now use Aerotech’s approved SVG logo, clearer entry points for each audience, balanced spacing and a responsive layout. The collaboration work adds projects, tasks, scalable staff invitations, a private document library and background automation to the existing portal shell.

**Release status: review implementation; the full Phase 2 checklist is not signed off.** No production migration or deployment has been performed. The first automatic preview was rejected because the Vercel Hobby plan disallows the proposed five-minute cron. That unsupported Vercel schedule has been removed; an inactive GitHub Actions schedule is provided instead. Provider-backed acceptance testing and guest access, multilingual coverage and the remaining product limits below need to be resolved before calling the entire brief complete.

## 1. Data model and endpoints

The initial audit and model plan are recorded in [plan.md](plan.md). The implementation uses the existing Next.js, React and PostgreSQL stack. Migration `037_collaboration.sql` is additive. Tenant identifiers and composite foreign keys keep related records in the same company. Session identity, project membership and document grants are checked on the server. Viewer roles cannot write; project owners/managers control structural changes.

| Area | Records and relationships | Main endpoints |
| --- | --- | --- |
| Projects and tasks | Projects → memberships, milestones and tasks. Tasks → multiple assignees, dependencies, subtasks, checklist items, comments, attachments and time entries. Saved filters belong to an actor and company. | `/api/projects`, `/api/projects/my-tasks`, `/api/projects/saved-views`, `/api/projects/:id`, nested `/tasks`, `/members`, `/milestones`, `/report` |
| Meetings | Existing rooms and participants gain scheduling, RSVP, attendance and revocation fields. Group references, exclusions and saved groups resolve inside the company on the server. Action items reference project tasks. | `/api/meet`, `/api/meet/people`, `/api/meet/groups`, `/api/meet/selection`, `/api/meet/:id/details`, `/api/meet/:id/join` |
| Documents | Folders → documents → immutable encrypted versions. Grants define access; acknowledgement records bind a person, version, content hash and decision. Restoring creates a new version. | `/api/document-library`, `/folders`, `/templates`, `/generate`, `/:id`, `/:id/download`, `/:id/signed-copy` |
| Automation | Durable jobs have deduplication keys, leases, attempts and retry/dead states. Notifications and preferences belong to an actor. Sensitive actions produce audit entries. | `/api/collaboration/notifications`, `/api/collaboration/search`, `/api/admin/audit`, `/api/cron/collaboration` |

Private API responses use `no-store`. Downloads require a valid session, document permission, a clean scan and a user/version-bound signature that lasts two minutes. Content uses AES-256-GCM with authenticated company, document and version context.

## 2. Implementation milestones

| Milestone | Implemented behavior | Practical limits |
| --- | --- | --- |
| Projects and tasks | Create/edit projects; members and roles; dates, budget, tags and priority; computed progress/health; milestones; task assignment/reassignment, status, checklist, subtasks, dependency cycle checks, comments and mentions; list sorting/grouping, Kanban, calendar and timeline; saved filters; optional timer/manual time; reports, CSV/PDF; dashboard widgets. | The overview does not yet aggregate a separate project files panel. Some collections use explicit bounded caps rather than complete next-page controls. Export covers the first 1,000 tasks and labels that limit. |
| Meetings | Debounced search across staff fields, 20 results per page, recent invitees first, server-resolved groups, required/optional selections, exclusions, collapsed chips, searchable selected-attendee dialog, bulk emails, saved groups, RSVP, notes, attendance and action-item conversion. Default timezone is Africa/Lagos. | External addresses are recorded but guest invitations and verified guest video access are not implemented. Availability checks Aerotech meetings only. Recurrence is daily/weekly fixed-interval behavior; DST-sensitive recurrence needs further work. |
| Meeting expiry | Request-time join window, scheduled expiry, cancellation/revocation state, generation-specific rooms, no direct video credentials in emails, short-lived JWTs, client expiry and 15-second cancellation checks. | An already issued provider token may remain acceptable for up to 60 seconds. The JaaS adapter sends a server-side room termination command on cancellation and queues retries; expiry queues termination too. Old issued JWTs remain a residual risk until their 60-second expiry unless explicitly banned. Provider enforcement has not been tested live. |
| Documents | Folder/category library; search and type/status filters; grid/list; multi-file upload and batch progress; magic-byte validation; encrypted versions; scan hook and quarantine; PDF/image preview; permissions; restore; merge-field PDF templates; acknowledgement decisions, reminders and audit receipt; retention cleanup. | Files are capped at 2 MB and stored encrypted in PostgreSQL. Office files download rather than render in-browser. The current PDF generator is ASCII-oriented. Owner/date/employee filters exist on the API but are not all exposed as polished UI filters. Signature scope is authenticated acknowledgement, not a certified signing provider. |
| Automation and quality | Leased job queue, retries and deduplication, meeting/job expiry, task due/overdue escalation, recurrence, daily/weekly digests, document/acknowledgement reminders, preference-aware notifications, permission-aware search and admin audit. | Actual email, malware scanner and conferencing-provider delivery/enforcement require configuration and live acceptance tests. Vercel Hobby rejected the five-minute cron; an opt-in GitHub Actions trigger is supplied instead and is not enabled. The worker handles at most 200 jobs or approximately 50 seconds per run; large campaign throughput needs load testing and worker capacity planning. |
| Homepage and sign-in | Approved transparent brand logo; redesigned hero, audience cards, workflow sections and sign-in panel; clearly separated role links; password visibility; mobile layout. Existing authentication endpoints and portal routing remain in use. | Public screenshots are included in `previews/`. No subscription prices were changed. |

The electronic signing scope chosen for this implementation is a consented acknowledgement of an immutable document version. The receipt records the original content hash and decision; it does not alter the original PDF or claim certificate-backed legal signing.

## 3. Verification

Tests run against synthetic fixtures only. The browser fixture contains 1,000 staff. Database/API integration uses isolated PGlite PostgreSQL; browser tests use its socket adapter and the real production Next.js server. API-handler tests mock session-cookie access and external providers. No real HR emails or video calls are sent.

Final results are recorded in [verification-results.md](verification-results.md), with machine-readable evidence in `evidence/`. Screenshots show synthetic data or public pages. The exact changed-file inventory is in [changed-files.md](changed-files.md).

### Migrations

`037_collaboration.sql` was applied successfully to an isolated database and applied a second time to check idempotence. The browser fixture also applied the repository’s registered baseline migrations through `037`, in order. The exact run list is in [migration-runs.md](migration-runs.md). **Production migrations run: none.**

### Reproduce

```sh
npm ci
npm test
npm run test:collaboration:db
npm run test:collaboration:api
npm run lint
npx tsc --noEmit
npm run build -- --webpack
npx playwright install chromium
npm run test:collaboration:browser
PHASE2_LIGHTHOUSE=1 npm run test:collaboration:browser
```

The browser suite starts a disposable database and local app itself. `CHROME_PATH` can select an installed Chromium binary. Run the suite after the build has completely finished; do not rebuild `.next` while a production server is using it. Local testing encountered a stale/empty generated pages manifest; a clean-build check on the deployment runner remains necessary. No generated build artifacts are included in this change.

## 4. Remaining release requirements and recommendations

1. Verify the JaaS room termination adapter against a staging meeting and finish per-token banning, external guest identity and invitation delivery. The adapter uses the documented administrative DESTROY endpoint; the 60-second token bound and client monitor alone do not guarantee provider-side termination. Emails intentionally link to the authenticated meeting page and never include a provider JWT; delivered emails cannot be recalled by this application.
2. Configure production document encryption and HTTPS malware scanning, then verify email delivery and the authenticated scheduler. Read-only deployment metadata confirmed JaaS, Resend and the cron bearer secret already exist; the new document key and scan adapter settings are absent. Secret values were not retrieved. Keep uploads quarantined when scanning is unavailable. Add key rotation, backup/restore exercises, dead-job monitoring and sustained queue throughput testing before campaign traffic.
3. Complete translation-catalog coverage for the new English UI and use a Unicode-capable PDF renderer before claiming full i18n support. Check timezone recurrence across DST transitions.
4. Finish remaining collection pagination, advanced document metadata/filter controls and the project files overview. Add per-file byte progress and object storage for larger document volumes. Navigation to a search result currently opens its containing project/library; direct task/document opening can be improved.
5. Treat the selected automated axe and Lighthouse runs as sampled evidence, not full WCAG certification or verification of every route. Complete manual keyboard/screen-reader review and provider-backed end-to-end flows in staging. Authenticated pages intentionally block indexing, so the requested SEO ≥90 on every portal page is not met.
6. Reconcile the baseline Part 1 discrepancy: legacy vacancy-approval files and an admin navigation entry remain in the audited source, although the employee/employer approval paths are denied. This branch does not claim their complete removal.

### Production configuration

| Setting | Purpose |
| --- | --- |
| `DOCUMENT_ENCRYPTION_KEY` | Base64-encoded 32-byte document encryption key; retain securely with backups. |
| `DOCUMENT_SCAN_URL`, `DOCUMENT_SCAN_TOKEN` | Authenticated HTTPS scan adapter returning `clean` or `infected`; failures leave content quarantined. |
| `RESEND_API_KEY`, `INVITATION_FROM_EMAIL` | Email delivery credentials and verified sender. |
| `CRON_SECRET` | Bearer authentication for scheduled collaboration jobs. |
| `APP_BASE_URL` (existing), optional `NEXT_PUBLIC_SITE_URL` fallback | Correct public application origin for portal-specific notification links. |
| `JAAS_APP_ID`, `JAAS_KEY_ID`, `JAAS_PRIVATE_KEY` | Managed JaaS meeting signing, if selected. |
| `JITSI_DOMAIN`, `JITSI_APP_ID`, `JITSI_APP_SECRET`, optional `JITSI_JWT_SUB` | Alternative self-hosted Jitsi JWT configuration. Provider revocation still requires an adapter. |

Do not merge/deploy this review branch as a declaration that every Phase 2 acceptance criterion is complete. Resolve the explicit release requirements, run migrations in staging, and verify the real providers first.

Provider reference: [8x8 JaaS conference-management endpoints](https://developer.8x8.com/jaas/docs/webhooks-jaas-endpoints/), checked 27 October 2026. No live termination commands were sent during this work.

### Scheduler setup on the current hosting plan

The optional `.github/workflows/collaboration-scheduler.yml` runs only when repository variable `COLLABORATION_SCHEDULER_ENABLED` is `true`. Configure `COLLABORATION_CRON_URL` to the HTTPS `/api/cron/collaboration` endpoint and repository secret `COLLABORATION_CRON_SECRET` to the same bearer value as the deployment’s `CRON_SECRET`. Leave the switch off until migration/provider acceptance is complete. No repository secret was created, exposed or copied. GitHub scheduled workflows are best effort and can be delayed; a dedicated worker/scheduler is recommended for strict timing and campaign throughput.

Scheduler references: [GitHub workflow schedules](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onschedule) and [scheduled-event delays](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule), checked 27 October 2026.
