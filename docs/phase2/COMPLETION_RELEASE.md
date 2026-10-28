# Aerotech completion release

28 October 2026. Domain work excluded.

## Implemented

- Employee Recruitment entry links to opportunities inside the employee portal; hiring APIs retain employer permissions. Applicants retain their separate job/application workspace.
- Shared success feedback clears after seven seconds across 35 components/pages. Errors and instructions remain visible. Saved cookie and privacy editors close; document actions close after successful saves. An untouched dialog or account menu closes after inactivity. Keep open disables dialog timing, and editing preserves unsaved data.
- Viewing a notice marks it read and removes it from the active inbox. History remains available; notification counts refresh immediately. Birthday alerts expire at the end of the relevant Africa/Lagos celebration day, including old alerts. An empty birthday reminder panel is hidden.
- External guest invitations are queued through Resend. Personal bearer invitations bind an email address, meeting and room generation, grant no workforce access and are checked against the join window on every request. Attendance is recorded. Direct video credentials never appear in invitation emails.
- The five-minute GitHub Actions scheduler now uses verified short-lived GitHub OIDC identity scoped to the immutable repository/owner IDs, main branch and exact workflow. No production bearer secret was copied to GitHub. Vercel’s existing secret-authenticated cron remains supported. GitHub schedules are best effort.
- Added document owner/employee/date filters, server sorting, metadata editing and version-page controls. Added paginated, permission-aware project-file and membership endpoints. File links recheck document access.
- PDF exports embed a licensed font and retain supported non-ASCII names and currency characters. Unsupported glyphs produce an explicit error rather than silently corrupting the text. This is not universal script coverage.
- About copy follows Aerotech’s connected workforce positioning and “People. Performance. Progress.” brand plan found in Google Drive. Legal copy removes unfinished edit markers and explicitly discloses unverified operator particulars. No registration, address, certification or customer claims were invented.
- Fixed same-origin checks on settings/privacy/billing/security mutation routes to use the requested host behind the hosting proxy. Preserved concurrent release fixes for form POST fallbacks, dark-theme contrast, profile rendering and HR credential tracking.

## Model and migrations

The data/endpoint plan is recorded in COMPLETION_PLAN.md. `038_notification_lifecycle.sql` adds expiry columns and active-feed indexes, then backfills birthday expiry. `039_guest_meetings.sql` adds invitation and attendance timestamps. Both migrations were applied transactionally on the existing Neon production main branch with checksum checks and a migration advisory lock. Readback confirmed both ledger entries and 41 total migrations. No database reset or record deletion was performed.

## Verification

50 unit checks, 24 API-handler checks and 13 isolated database checks passed. The browser suite passed 18 checks with a 1,000-person fixture, including the new notification lifecycle and settings flows. TypeScript, lint and the webpack production build passed. Browser axe checks cover sampled public and employer collaboration pages; they are not a claim of certification for every route. Evidence is in evidence/completion-*.txt. The final combined source preserves the parallel verification fixes and receives a final build/browser pass before promotion.

## Remaining real dependencies and limits

The malware scanner URL/token are absent. Uploads stay quarantined; the worker does not waste retry attempts on an unconfigured scanner. Supply a real scanning service before document downloads can be enabled safely. Live external email and conference-provider acceptance still requires a real invited-user check; synthetic tests do not certify delivery or 8x8 enforcement.

Registered legal entity, registration number, postal address, DPO appointment, retention schedule and company commercial terms could not be established from available company sources. The service notice labels those facts as unverified. Confirm them before adopting a final company processing agreement.

Electronic signing is authenticated, consented version-bound acknowledgement with an audit receipt; certificate-backed signing is not configured. English (en-GB) is the currently supported UI locale. Office files download rather than render inline; upload size remains 2 MB; large-volume object storage, a full translation programme and remaining bounded report/overview collections are follow-up work. The release is not a claim that every original Phase 2 acceptance criterion is complete.

## Sources

Company brand plan: https://docs.google.com/document/d/10oXKtlytg1y6hgo1Nsw721hFfhCIhzvwdoLOORlb45c/edit

Technical identity reference: https://docs.github.com/en/actions/reference/security/oidc

PDF font reference: https://pdf-lib.js.org/docs/api/classes/pdfdocument

Data-rights reference: https://ndpc.gov.ng/faqs/
