# Verification results

27 October 2026 · Synthetic fixtures only · No production deployment or migration

| Check | Result | Evidence |
| --- | --- | --- |
| Unit tests | 42 passed, 0 failed | `evidence/unit-tests.txt` |
| Isolated database integration | 13 checks passed | `evidence/database-tests.txt` |
| Actual API-handler integration | 21 checks passed | `evidence/api-tests.txt` |
| Browser flows | 14 checks passed | `evidence/browser-results.json` and `browser-tests.txt` |
| TypeScript | `npx tsc --noEmit` passed | Final production build also runs TypeScript. |
| Lint | Zero errors/warnings | `npm run lint` |
| Production build | Passed with webpack | `evidence/build-summary.txt` |
| Automated axe | Zero violations on 5 sampled pages | `axe-home`, `axe-login`, `axe-projects`, `axe-meet`, `axe-documents` JSON |
| Migration 037 | Applied successfully and rerun for idempotence in isolation | `migration-runs.md` |

## Lighthouse mobile simulation

Measurements use a local production build with synthetic data and simulated mobile throttling. They are not production service-level guarantees. The UI measurements precede the final server-side JaaS termination adapter and permission cleanup; final browser checks cover those changes. Six sampled pages were tested, not every route.

| Page | Performance | Accessibility | Best practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| home | 98 | 100 | 100 | 100 |
| login | 99 | 100 | 100 | 100 |
| projects | 99 | 100 | 100 | 69 |
| meetings | 98 | 100 | 96 | 69 |
| documents | 97 | 100 | 100 | 69 |
| employee-tasks | 99 | 100 | 100 | 69 |

All sampled performance, accessibility and best-practice scores exceed 90. Portal SEO scores are 69 because those pages intentionally block indexing. The requested ≥90 in **every** category on **every** page is therefore **not met**. One meeting-page best-practice deduction was caused by a prefetch request rejected by the disposable PGlite socket adapter (`unnamed prepared statement does not exist`); real PostgreSQL load testing remains necessary.

## Browser flows verified

- Public homepage and real logo render, employee and applicant sign-ins remain visible.
- Sign-in refresh keeps separate roles and password visibility.
- axe WCAG 2.2 AA /.
- axe WCAG 2.2 AA /auth/login?role=applicant.
- Employer project create and Kanban task flow persists through API and database.
- Meeting picker pages a thousand staff and group chips stay bounded.
- Employer uploads an encrypted document and the browser shows quarantine status.
- Employer isolation and axe /dashboard/employer/projects.
- Employer isolation and axe /dashboard/employer/meet.
- Employer isolation and axe /dashboard/employer/documents.
- Employee sees shared project only and is blocked from employer portal.
- Mobile employee tasks page has no horizontal overflow.
- Applicant cannot access collaboration API or employer pages.
- Admin audit renders and employee cannot call its API.

## Acceptance checklist

- [x] Project/task creation, assignment, status updates and comments/notification infrastructure implemented; browser create/complete flow and API permission checks pass.
- [x] Project/task/document tenant and membership/grant checks tested at the API/service boundary; sampled portal routes deny cross-role access.
- [x] Invite picker tested with 1,000 mock staff, 20-person pages and a group-reference scheduling payload under 2 KB.
- [x] Expired/cancelled join requests deny access server-side; issued video JWTs are bounded to 60 seconds and meeting expiry.
- [x] Meeting action items convert to project tasks through the API.
- [x] Folder/version/permission/template and acknowledgement implementation exists; encryption, quarantine, signatures and acknowledgement replay are tested through API handlers.
- [x] Scheduler logic, preference suppression and deduplication tested with mocked delivery.
- [x] Search filters private resources by authenticated permissions.
- [ ] Live JaaS cancellation/expiry termination and per-token banning verified with the provider.
- [ ] External guest invitation/identity/video flow complete.
- [ ] Full multilingual UI/Unicode PDF support and the remaining product limits in `review.md` complete.
- [ ] Every legacy and new portal link/critical flow verified; legacy vacancy-approval admin entry reconciled.
- [ ] Live email/scanner/scheduler acceptance and campaign-scale queue/real PostgreSQL load tests complete.
- [ ] All-route Lighthouse ≥90 on every category and full manual WCAG review complete.

These unchecked items prevent declaring the full Phase 2 specification complete.

Hosting check: the initial automatic Vercel preview was rejected before build because the project is on Hobby and the new cron ran every five minutes. The unsupported Vercel entry was removed. The supplied GitHub schedule is opt-in and unconfigured; production automation is not active.

Latest hosted preview: **blocked**. After correcting the cron configuration, Vercel rejected preview `dpl_6n8F7NwcXVunQ48Zj1x8wj4CnrQ2` with `BUILD_FAILED: Resource provisioning failed` before compilation. No build events were returned. This is separate from the successful local production build; a hosted preview is not verified.
