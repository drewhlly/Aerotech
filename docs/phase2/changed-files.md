# Changed files

Inventory of 100 files in this review change. Local dependency installation artifacts, generated Next.js files and temporary debug files are excluded.

| File | Purpose |
| --- | --- |
| `database/037_collaboration.sql` | Adds tenant-scoped collaboration, document, notification and queue tables/indexes. |
| `docs/phase2/changed-files.md` | Documents the model plan, implementation, verification, migration runs or changed-file inventory. |
| `docs/phase2/evidence/api-tests.txt` | Records a test run or condensed automated audit result; synthetic fixtures only. |
| `docs/phase2/evidence/axe-documents.json` | Records a test run or condensed automated audit result; synthetic fixtures only. |
| `docs/phase2/evidence/axe-home.json` | Records a test run or condensed automated audit result; synthetic fixtures only. |
| `docs/phase2/evidence/axe-login.json` | Records a test run or condensed automated audit result; synthetic fixtures only. |
| `docs/phase2/evidence/axe-meet.json` | Records a test run or condensed automated audit result; synthetic fixtures only. |
| `docs/phase2/evidence/axe-projects.json` | Records a test run or condensed automated audit result; synthetic fixtures only. |
| `docs/phase2/evidence/browser-results.json` | Records a test run or condensed automated audit result; synthetic fixtures only. |
| `docs/phase2/evidence/browser-tests.txt` | Records a test run or condensed automated audit result; synthetic fixtures only. |
| `docs/phase2/evidence/build-summary.txt` | Records a test run or condensed automated audit result; synthetic fixtures only. |
| `docs/phase2/evidence/database-tests.txt` | Records a test run or condensed automated audit result; synthetic fixtures only. |
| `docs/phase2/evidence/lighthouse-documents.json` | Records a test run or condensed automated audit result; synthetic fixtures only. |
| `docs/phase2/evidence/lighthouse-employee-tasks.json` | Records a test run or condensed automated audit result; synthetic fixtures only. |
| `docs/phase2/evidence/lighthouse-home.json` | Records a test run or condensed automated audit result; synthetic fixtures only. |
| `docs/phase2/evidence/lighthouse-login.json` | Records a test run or condensed automated audit result; synthetic fixtures only. |
| `docs/phase2/evidence/lighthouse-meetings.json` | Records a test run or condensed automated audit result; synthetic fixtures only. |
| `docs/phase2/evidence/lighthouse-projects.json` | Records a test run or condensed automated audit result; synthetic fixtures only. |
| `docs/phase2/evidence/lighthouse-scores.json` | Records a test run or condensed automated audit result; synthetic fixtures only. |
| `docs/phase2/evidence/unit-tests.txt` | Records a test run or condensed automated audit result; synthetic fixtures only. |
| `docs/phase2/migration-runs.md` | Documents the model plan, implementation, verification, migration runs or changed-file inventory. |
| `docs/phase2/plan.md` | Documents the model plan, implementation, verification, migration runs or changed-file inventory. |
| `docs/phase2/previews/home.png` | Public-page screenshot for visual review. |
| `docs/phase2/previews/sign-in.png` | Public-page screenshot for visual review. |
| `docs/phase2/review.md` | Documents the model plan, implementation, verification, migration runs or changed-file inventory. |
| `docs/phase2/verification-results.md` | Documents the model plan, implementation, verification, migration runs or changed-file inventory. |
| `package-lock.json` | Locks verification dependency versions. |
| `package.json` | Adds isolated integration/browser test commands and verification dependencies. |
| `public/brand/aerotech-logo-white.svg` | Adds the approved Aerotech SVG logo asset. |
| `public/brand/aerotech-logo.svg` | Adds the approved Aerotech SVG logo asset. |
| `scripts/migrate.mjs` | Registers additive migration 037. |
| `scripts/phase2-browser-suite.mjs` | Provides a disposable fixture or browser/Lighthouse verification runner. |
| `scripts/phase2-lighthouse.mjs` | Provides a disposable fixture or browser/Lighthouse verification runner. |
| `scripts/phase2-test-db.mjs` | Provides a disposable fixture or browser/Lighthouse verification runner. |
| `scripts/verify-phase2.mjs` | Provides a disposable fixture or browser/Lighthouse verification runner. |
| `src/app/(public)/page.tsx` | Redesigns the public homepage with audience-specific navigation and brand styling. |
| `src/app/admin/audit/page.tsx` | Connects this portal route to the shared collaboration UI while retaining legacy records where applicable. |
| `src/app/api/admin/audit/route.ts` | Implements or updates the permission-checked /api/admin/audit handler. |
| `src/app/api/collaboration/notifications/route.ts` | Implements or updates the permission-checked /api/collaboration/notifications handler. |
| `src/app/api/collaboration/search/route.ts` | Implements or updates the permission-checked /api/collaboration/search handler. |
| `src/app/api/cron/collaboration/route.ts` | Implements or updates the permission-checked /api/cron/collaboration handler. |
| `src/app/api/document-library/[[...segments]]/route.ts` | Implements or updates the permission-checked /api/document-library/[[...segments]] handler. |
| `src/app/api/meet/[id]/details/route.ts` | Implements or updates the permission-checked /api/meet/[id]/details handler. |
| `src/app/api/meet/[id]/join/route.ts` | Implements or updates the permission-checked /api/meet/[id]/join handler. |
| `src/app/api/meet/groups/route.ts` | Implements or updates the permission-checked /api/meet/groups handler. |
| `src/app/api/meet/people/route.ts` | Implements or updates the permission-checked /api/meet/people handler. |
| `src/app/api/meet/route.ts` | Implements or updates the permission-checked /api/meet handler. |
| `src/app/api/meet/selection/route.ts` | Implements or updates the permission-checked /api/meet/selection handler. |
| `src/app/api/projects/[[...segments]]/route.ts` | Implements or updates the permission-checked /api/projects/[[...segments]] handler. |
| `src/app/dashboard/employer/documents/page.tsx` | Connects this portal route to the shared collaboration UI while retaining legacy records where applicable. |
| `src/app/dashboard/employer/notifications/legacy-notifications.tsx` | Connects this portal route to the shared collaboration UI while retaining legacy records where applicable. |
| `src/app/dashboard/employer/notifications/page.tsx` | Connects this portal route to the shared collaboration UI while retaining legacy records where applicable. |
| `src/app/dashboard/employer/page.tsx` | Connects this portal route to the shared collaboration UI while retaining legacy records where applicable. |
| `src/app/dashboard/employer/projects/[id]/page.tsx` | Connects this portal route to the shared collaboration UI while retaining legacy records where applicable. |
| `src/app/dashboard/employer/projects/page.tsx` | Connects this portal route to the shared collaboration UI while retaining legacy records where applicable. |
| `src/app/dashboard/employer/tasks/page.tsx` | Connects this portal route to the shared collaboration UI while retaining legacy records where applicable. |
| `src/app/employee/documents/page.tsx` | Connects this portal route to the shared collaboration UI while retaining legacy records where applicable. |
| `src/app/employee/notifications/legacy-notifications.tsx` | Connects this portal route to the shared collaboration UI while retaining legacy records where applicable. |
| `src/app/employee/notifications/page.tsx` | Connects this portal route to the shared collaboration UI while retaining legacy records where applicable. |
| `src/app/employee/page.tsx` | Connects this portal route to the shared collaboration UI while retaining legacy records where applicable. |
| `src/app/employee/projects/[id]/page.tsx` | Connects this portal route to the shared collaboration UI while retaining legacy records where applicable. |
| `src/app/employee/projects/page.tsx` | Connects this portal route to the shared collaboration UI while retaining legacy records where applicable. |
| `src/app/employee/tasks/page.tsx` | Connects this portal route to the shared collaboration UI while retaining legacy records where applicable. |
| `src/components/admin-nav.tsx` | Adds or connects admin nav UI to the existing design system and portal context. |
| `src/components/aerotech-portal.tsx` | Adds or connects aerotech portal UI to the existing design system and portal context. |
| `src/components/aerotech-ui.tsx` | Adds or connects aerotech ui UI to the existing design system and portal context. |
| `src/components/brand-logo.tsx` | Adds or connects brand logo UI to the existing design system and portal context. |
| `src/components/collaboration-audit.tsx` | Adds or connects collaboration audit UI to the existing design system and portal context. |
| `src/components/collaboration-client.ts` | Adds or connects collaboration client UI to the existing design system and portal context. |
| `src/components/collaboration-dialog.tsx` | Adds or connects collaboration dialog UI to the existing design system and portal context. |
| `src/components/collaboration-notifications.tsx` | Adds or connects collaboration notifications UI to the existing design system and portal context. |
| `src/components/collaboration-search.tsx` | Adds or connects collaboration search UI to the existing design system and portal context. |
| `src/components/collaboration-widgets.tsx` | Adds or connects collaboration widgets UI to the existing design system and portal context. |
| `src/components/document-library.tsx` | Adds or connects document library UI to the existing design system and portal context. |
| `src/components/employee-nav.tsx` | Adds or connects employee nav UI to the existing design system and portal context. |
| `src/components/employer-nav.tsx` | Adds or connects employer nav UI to the existing design system and portal context. |
| `src/components/login-form.tsx` | Adds or connects login form UI to the existing design system and portal context. |
| `src/components/meeting-list.tsx` | Adds or connects meeting list UI to the existing design system and portal context. |
| `src/components/meeting-room.tsx` | Adds or connects meeting room UI to the existing design system and portal context. |
| `src/components/notification-bell.tsx` | Adds or connects notification bell UI to the existing design system and portal context. |
| `src/components/people-picker.tsx` | Adds or connects people picker UI to the existing design system and portal context. |
| `src/components/projects-workspace.tsx` | Adds or connects projects workspace UI to the existing design system and portal context. |
| `src/components/resource-picker.tsx` | Adds or connects resource picker UI to the existing design system and portal context. |
| `src/components/task-calendar.tsx` | Adds or connects task calendar UI to the existing design system and portal context. |
| `src/components/workspace-shell.tsx` | Adds or connects workspace shell UI to the existing design system and portal context. |
| `src/lib/collaboration-policy.ts` | Defines role, window, progress, origin, pagination and export policies. |
| `src/lib/collaboration-worker.ts` | Executes leased/retryable notifications, reminders, expiry, recurrence, retention and termination jobs. |
| `src/lib/collaboration.ts` | Centralises tenant identity, access checks, transactions, notifications and auditing. |
| `src/lib/document-crypto.ts` | Encrypts document versions and signs/verifies expiring user-bound downloads. |
| `src/lib/meeting-provider.ts` | Signs short-lived JaaS admin requests and sends server-side room termination commands. |
| `src/lib/meeting-service.ts` | Resolves invitation groups and schedules company-scoped meetings. |
| `src/lib/project-service.ts` | Implements project/task operations, membership, assignment, revision and dependency rules. |
| `src/lib/simple-pdf.ts` | Creates bounded text PDF exports and acknowledgement receipts. |
| `src/proxy.ts` | Returns direct 403 denials and validates mutation origins against the requested host. |
| `tests/collaboration-api.integration.mjs` | Adds isolated policy, crypto, provider-adapter, SQL or API regression verification. |
| `tests/collaboration-db.integration.mjs` | Adds isolated policy, crypto, provider-adapter, SQL or API regression verification. |
| `tests/collaboration.test.mjs` | Adds isolated policy, crypto, provider-adapter, SQL or API regression verification. |
| `tests/helpers/ts-loader.mjs` | Adds isolated policy, crypto, provider-adapter, SQL or API regression verification. |
| `tests/meeting-provider.test.mjs` | Adds isolated policy, crypto, provider-adapter, SQL or API regression verification. |
| `vercel.json` | Registers the collaboration scheduler. |
