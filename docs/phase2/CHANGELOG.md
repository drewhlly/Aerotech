# Phase 2 Part 1 — File change summary

Review branch: `feat/phase2-part1`, PR #27.

Production migration log: **none applied**. Migration 037 has run in disposable CI only; production remains on the previous schema.

| File | Change |
| --- | --- |
| `.github/workflows/signed-in-verification.yml` | Retire Employee agreement collection while preserving employer staff administration and automation. |
| `database/037_phase2_jobs_privacy.sql` | Publish legacy pending jobs; remove retired fields; add safety, verification, consent, rights and audit records. |
| `docs/phase2/AUDIT_AND_PLAN.md` | Record the audit, route inventory, rollout procedure and file-level changes. |
| `docs/phase2/CHANGELOG.md` | Record the audit, route inventory, rollout procedure and file-level changes. |
| `docs/phase2/route-inventory.json` | Record the audit, route inventory, rollout procedure and file-level changes. |
| `scripts/migrate.mjs` | Record migration checksums, prevent replay and support explicit adoption of an existing schema. |
| `scripts/verify-dashboard-states.mjs` | Verify publication, privacy, accessibility, portal isolation or existing signed-in journeys. |
| `scripts/verify-phase2.mjs` | Verify publication, privacy, accessibility, portal isolation or existing signed-in journeys. |
| `scripts/verify-portal-isolation.mjs` | Verify publication, privacy, accessibility, portal isolation or existing signed-in journeys. |
| `scripts/verify-public-routes.mjs` | Verify publication, privacy, accessibility, portal isolation or existing signed-in journeys. |
| `scripts/verify-route-crawl.mjs` | Verify publication, privacy, accessibility, portal isolation or existing signed-in journeys. |
| `scripts/verify-signed-in.mjs` | Verify publication, privacy, accessibility, portal isolation or existing signed-in journeys. |
| `src/app/(public)/about/page.tsx` | Connect the relevant role page to shared UI, attention widgets or the updated feature flow. |
| `src/app/(public)/careers/[id]/page.tsx` | Provide safe immediate publication, public discovery, expiry, reports or SEO job details. |
| `src/app/(public)/careers/page.tsx` | Provide safe immediate publication, public discovery, expiry, reports or SEO job details. |
| `src/app/(public)/cookies/page.tsx` | Provide legal drafts, policy versioning or in-portal privacy controls. |
| `src/app/(public)/privacy/page.tsx` | Provide legal drafts, policy versioning or in-portal privacy controls. |
| `src/app/(public)/terms/page.tsx` | Provide legal drafts, policy versioning or in-portal privacy controls. |
| `src/app/admin/error.tsx` | Provide a shared retry boundary within this portal. |
| `src/app/admin/loading.tsx` | Use the shared loading skeleton within this portal. |
| `src/app/admin/page.tsx` | Connect the relevant role page to shared UI, attention widgets or the updated feature flow. |
| `src/app/admin/privacy/page.tsx` | Provide legal drafts, policy versioning or in-portal privacy controls. |
| `src/app/admin/safeguards/page.tsx` | Connect the relevant role page to shared UI, attention widgets or the updated feature flow. |
| `src/app/admin/vacancy-approvals/page.tsx` | Remove the retired vacancy-review or Employee agreement entry point. |
| `src/app/api/admin/job-safety/route.ts` | Restrict platform safeguards, verification and privacy responses to Super Admin. |
| `src/app/api/admin/privacy-requests/route.ts` | Restrict platform safeguards, verification and privacy responses to Super Admin. |
| `src/app/api/ats/route.ts` | Update shared types, routing, configuration or feature integration for Part 1. |
| `src/app/api/auth/activate/employee/route.ts` | Require and record versioned registration acceptance. |
| `src/app/api/auth/signup/applicant/route.ts` | Require and record versioned registration acceptance. |
| `src/app/api/auth/signup/employer/route.ts` | Require and record versioned registration acceptance. |
| `src/app/api/cron/workflows/route.ts` | Retire Employee agreement collection while preserving employer staff administration and automation. |
| `src/app/api/employee/learning/route.ts` | Retire Employee agreement collection while preserving employer staff administration and automation. |
| `src/app/api/employer/verification/route.ts` | Separate company identity verification from vacancy publication. |
| `src/app/api/jobs/report/route.ts` | Update shared types, routing, configuration or feature integration for Part 1. |
| `src/app/api/privacy/cookies/route.ts` | Implement versioned cookie choices, scoped account export or tracked data-rights requests. |
| `src/app/api/privacy/export/route.ts` | Implement versioned cookie choices, scoped account export or tracked data-rights requests. |
| `src/app/api/privacy/requests/route.ts` | Implement versioned cookie choices, scoped account export or tracked data-rights requests. |
| `src/app/api/vacancy-approvals/route.ts` | Remove the retired vacancy-review or Employee agreement entry point. |
| `src/app/api/workflows/route.ts` | Retire Employee agreement collection while preserving employer staff administration and automation. |
| `src/app/api/workspace/attention/route.ts` | Connect the relevant role page to shared UI, attention widgets or the updated feature flow. |
| `src/app/applicant/error.tsx` | Provide a shared retry boundary within this portal. |
| `src/app/applicant/loading.tsx` | Use the shared loading skeleton within this portal. |
| `src/app/applicant/privacy/page.tsx` | Provide legal drafts, policy versioning or in-portal privacy controls. |
| `src/app/auth/activate/page.tsx` | Require and record versioned registration acceptance. |
| `src/app/auth/signup/applicant/page.tsx` | Require and record versioned registration acceptance. |
| `src/app/auth/signup/employer/page.tsx` | Require and record versioned registration acceptance. |
| `src/app/dashboard/employer/account/page.tsx` | Connect the relevant role page to shared UI, attention widgets or the updated feature flow. |
| `src/app/dashboard/employer/employees/new/page.tsx` | Connect the relevant role page to shared UI, attention widgets or the updated feature flow. |
| `src/app/dashboard/employer/employees/page.tsx` | Connect the relevant role page to shared UI, attention widgets or the updated feature flow. |
| `src/app/dashboard/employer/error.tsx` | Provide a shared retry boundary within this portal. |
| `src/app/dashboard/employer/hr/attendance/page.tsx` | Use shared tables with filtering, selection, export and retry/loading states. |
| `src/app/dashboard/employer/layout.tsx` | Update shared types, routing, configuration or feature integration for Part 1. |
| `src/app/dashboard/employer/loading.tsx` | Use the shared loading skeleton within this portal. |
| `src/app/dashboard/employer/page.tsx` | Connect the relevant role page to shared UI, attention widgets or the updated feature flow. |
| `src/app/dashboard/employer/privacy/page.tsx` | Provide legal drafts, policy versioning or in-portal privacy controls. |
| `src/app/dashboard/employer/recruitment/approvals/page.tsx` | Remove the retired vacancy-review or Employee agreement entry point. |
| `src/app/dashboard/employer/recruitment/jobs/new/page.tsx` | Connect the relevant role page to shared UI, attention widgets or the updated feature flow. |
| `src/app/employee/error.tsx` | Provide a shared retry boundary within this portal. |
| `src/app/employee/loading.tsx` | Use the shared loading skeleton within this portal. |
| `src/app/employee/onboarding/page.tsx` | Remove the retired vacancy-review or Employee agreement entry point. |
| `src/app/employee/opportunities/[id]/page.tsx` | Provide safe immediate publication, public discovery, expiry, reports or SEO job details. |
| `src/app/employee/opportunities/page.tsx` | Provide safe immediate publication, public discovery, expiry, reports or SEO job details. |
| `src/app/employee/page.tsx` | Connect the relevant role page to shared UI, attention widgets or the updated feature flow. |
| `src/app/employee/privacy/page.tsx` | Provide legal drafts, policy versioning or in-portal privacy controls. |
| `src/app/employee/vacancy-approvals/page.tsx` | Remove the retired vacancy-review or Employee agreement entry point. |
| `src/app/globals.css` | Define shared visual tokens, responsive layouts, focus states and themes. |
| `src/app/sitemap.ts` | Update shared types, routing, configuration or feature integration for Part 1. |
| `src/components/admin-nav.tsx` | Maintain isolated navigation and a consistent grouped, collapsible role shell. |
| `src/components/applicant-nav.tsx` | Maintain isolated navigation and a consistent grouped, collapsible role shell. |
| `src/components/cookie-notice.tsx` | Update shared types, routing, configuration or feature integration for Part 1. |
| `src/components/dashboard-attention.tsx` | Connect the relevant role page to shared UI, attention widgets or the updated feature flow. |
| `src/components/employee-learning.tsx` | Retire Employee agreement collection while preserving employer staff administration and automation. |
| `src/components/employee-nav.tsx` | Maintain isolated navigation and a consistent grouped, collapsible role shell. |
| `src/components/employee-profile-workspace.tsx` | Use controlled profile choices and a keyboard-accessible shared dialog. |
| `src/components/employer-nav.tsx` | Maintain isolated navigation and a consistent grouped, collapsible role shell. |
| `src/components/employer-verification.tsx` | Separate company identity verification from vacancy publication. |
| `src/components/hr-records.tsx` | Use shared tables with filtering, selection, export and retry/loading states. |
| `src/components/hr-workflow.tsx` | Retire Employee agreement collection while preserving employer staff administration and automation. |
| `src/components/job-catalogue.tsx` | Provide safe immediate publication, public discovery, expiry, reports or SEO job details. |
| `src/components/legal-page.tsx` | Provide legal drafts, policy versioning or in-portal privacy controls. |
| `src/components/live-reports.tsx` | Use shared tables with filtering, selection, export and retry/loading states. |
| `src/components/platform-controls.tsx` | Separate company identity verification from vacancy publication. |
| `src/components/policy-acceptance.tsx` | Provide legal drafts, policy versioning or in-portal privacy controls. |
| `src/components/portal-nav.tsx` | Maintain isolated navigation and a consistent grouped, collapsible role shell. |
| `src/components/privacy-settings.tsx` | Provide legal drafts, policy versioning or in-portal privacy controls. |
| `src/components/public-footer.tsx` | Update shared types, routing, configuration or feature integration for Part 1. |
| `src/components/recruitment-workspace.tsx` | Update shared types, routing, configuration or feature integration for Part 1. |
| `src/components/report-job.tsx` | Provide safe immediate publication, public discovery, expiry, reports or SEO job details. |
| `src/components/route-error.tsx` | Provide a shared retry boundary within this portal. |
| `src/components/ui/combobox.tsx` | Provide shared controls, table interactions, account-scoped draft recovery and accessible states. |
| `src/components/ui/data-table.tsx` | Provide shared controls, table interactions, account-scoped draft recovery and accessible states. |
| `src/components/ui/index.tsx` | Provide shared controls, table interactions, account-scoped draft recovery and accessible states. |
| `src/components/use-form-draft.ts` | Provide shared controls, table interactions, account-scoped draft recovery and accessible states. |
| `src/components/vacancy-approvals.tsx` | Remove the retired vacancy-review or Employee agreement entry point. |
| `src/components/workflow-workspace.tsx` | Retire Employee agreement collection while preserving employer staff administration and automation. |
| `src/components/workspace-shell.tsx` | Maintain isolated navigation and a consistent grouped, collapsible role shell. |
| `src/components/workspace-tools.tsx` | Maintain isolated navigation and a consistent grouped, collapsible role shell. |
| `src/lib/ats.ts` | Update shared types, routing, configuration or feature integration for Part 1. |
| `src/lib/employee-profile-fields.ts` | Use controlled profile choices and a keyboard-accessible shared dialog. |
| `src/lib/job-options.ts` | Provide safe immediate publication, public discovery, expiry, reports or SEO job details. |
| `src/lib/job-policy.ts` | Provide safe immediate publication, public discovery, expiry, reports or SEO job details. |
| `src/lib/job-publishing.ts` | Provide safe immediate publication, public discovery, expiry, reports or SEO job details. |
| `src/lib/job-search.ts` | Provide safe immediate publication, public discovery, expiry, reports or SEO job details. |
| `src/lib/legal-content.ts` | Provide legal drafts, policy versioning or in-portal privacy controls. |
| `src/lib/policy.ts` | Provide legal drafts, policy versioning or in-portal privacy controls. |
| `src/lib/portal-routing.ts` | Update shared types, routing, configuration or feature integration for Part 1. |
| `src/lib/privacy-actor.ts` | Provide legal drafts, policy versioning or in-portal privacy controls. |
| `src/lib/public-jobs.ts` | Update shared types, routing, configuration or feature integration for Part 1. |
| `src/lib/route-metadata.ts` | Update shared types, routing, configuration or feature integration for Part 1. |
| `src/lib/structured-data.ts` | Escape untrusted JSON-LD text before embedding it in a script. |
| `src/lib/subscriptions.ts` | Update shared types, routing, configuration or feature integration for Part 1. |
| `src/lib/workflow-automation.ts` | Retire Employee agreement collection while preserving employer staff administration and automation. |
| `src/proxy.ts` | Update shared types, routing, configuration or feature integration for Part 1. |
| `tests/job-policy.test.mjs` | Verify publication, privacy, accessibility, portal isolation or existing signed-in journeys. |
| `tests/launch-smoke.test.mjs` | Verify publication, privacy, accessibility, portal isolation or existing signed-in journeys. |
| `tests/portal-automation.test.mjs` | Verify publication, privacy, accessibility, portal isolation or existing signed-in journeys. |
| `tests/portal-isolation.test.mjs` | Verify publication, privacy, accessibility, portal isolation or existing signed-in journeys. |
| `tsconfig.json` | Update shared types, routing, configuration or feature integration for Part 1. |
| `src/app/dashboard/employer/payroll/page.tsx` | Add shared loading/retry states and a first-run setup action. |
