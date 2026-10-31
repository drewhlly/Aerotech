# File changes

| File | Purpose |
| --- | --- |
| `database/044_interview_scheduling_and_delivery.sql` | Additive interview availability, calendar revision and assessment review schema. |
| `docs/interviews/README.md` | Release audit, verification evidence and limitations. |
| `docs/interviews/evidence/browser-results.json` | Release audit, verification evidence and limitations. |
| `docs/interviews/evidence/lighthouse.json` | Release audit, verification evidence and limitations. |
| `scripts/automation-browser-suite.mjs` | Local production-build workflow and performance verification; synthetic fixtures only. |
| `scripts/lighthouse-interviews.mjs` | Local production-build workflow and performance verification; synthetic fixtures only. |
| `scripts/migrate.mjs` | Register migration 044. |
| `scripts/verify-interview-activation.mjs` | Local production-build workflow and performance verification; synthetic fixtures only. |
| `scripts/verify-recruitment-leave.mjs` | Local production-build workflow and performance verification; synthetic fixtures only. |
| `src/app/api/ats/route.ts` | Server-side tenant/role validation, scheduling, activation or assessment-review behaviour. |
| `src/app/api/auth/activate/employee/route.ts` | Server-side tenant/role validation, scheduling, activation or assessment-review behaviour. |
| `src/app/api/employees/invite/route.ts` | Server-side tenant/role validation, scheduling, activation or assessment-review behaviour. |
| `src/app/api/recruitment/calendar/route.ts` | Server-side tenant/role validation, scheduling, activation or assessment-review behaviour. |
| `src/app/api/recruitment/scheduling/route.ts` | Server-side tenant/role validation, scheduling, activation or assessment-review behaviour. |
| `src/app/applicant/interviews/page.tsx` | Portal page/layout integration for interview scheduling and secure activation. |
| `src/app/auth/activate/page.tsx` | Portal page/layout integration for interview scheduling and secure activation. |
| `src/app/auth/layout.tsx` | Portal page/layout integration for interview scheduling and secure activation. |
| `src/app/dashboard/employer/employees/[id]/page.tsx` | Portal page/layout integration for interview scheduling and secure activation. |
| `src/app/dashboard/employer/recruitment/scheduling/page.tsx` | Portal page/layout integration for interview scheduling and secure activation. |
| `src/components/activation-delivery-status.tsx` | Accessible workflow controls, delivery status, inline policies or accountable assessment review. |
| `src/components/activation-policies.tsx` | Accessible workflow controls, delivery status, inline policies or accountable assessment review. |
| `src/components/assessment-content-review.tsx` | Accessible workflow controls, delivery status, inline policies or accountable assessment review. |
| `src/components/employer-recruitment.tsx` | Accessible workflow controls, delivery status, inline policies or accountable assessment review. |
| `src/components/interview-scheduling.tsx` | Accessible workflow controls, delivery status, inline policies or accountable assessment review. |
| `src/components/recruitment-workspace.tsx` | Accessible workflow controls, delivery status, inline policies or accountable assessment review. |
| `src/lib/activation-delivery.ts` | Shared workflow logic, delivery retries, secure meetings, calendar export or metadata. |
| `src/lib/assessment-review.ts` | Shared workflow logic, delivery retries, secure meetings, calendar export or metadata. |
| `src/lib/ats.ts` | Shared workflow logic, delivery retries, secure meetings, calendar export or metadata. |
| `src/lib/collaboration-worker.ts` | Shared workflow logic, delivery retries, secure meetings, calendar export or metadata. |
| `src/lib/interview-delivery.ts` | Shared workflow logic, delivery retries, secure meetings, calendar export or metadata. |
| `src/lib/interview-scheduling.ts` | Shared workflow logic, delivery retries, secure meetings, calendar export or metadata. |
| `src/lib/invitation-email.ts` | Shared workflow logic, delivery retries, secure meetings, calendar export or metadata. |
| `src/lib/recruitment-calendar.ts` | Shared workflow logic, delivery retries, secure meetings, calendar export or metadata. |
| `src/lib/recruitment-interviews.ts` | Shared workflow logic, delivery retries, secure meetings, calendar export or metadata. |
| `src/lib/route-metadata.ts` | Shared workflow logic, delivery retries, secure meetings, calendar export or metadata. |
| `src/proxy.ts` | Narrow invitation activation exception while retaining portal guards. |
| `tests/activation-delivery.integration.mjs` | Disposable database regression coverage for workflow, security and boundary behaviour. |
| `tests/assessment-review.integration.mjs` | Disposable database regression coverage for workflow, security and boundary behaviour. |
| `tests/collaboration-api.integration.mjs` | Disposable database regression coverage for workflow, security and boundary behaviour. |
| `tests/employee-activation.integration.mjs` | Disposable database regression coverage for workflow, security and boundary behaviour. |
| `tests/event-expiry.integration.mjs` | Disposable database regression coverage for workflow, security and boundary behaviour. |
| `tests/interview-scheduling.integration.mjs` | Disposable database regression coverage for workflow, security and boundary behaviour. |
| `tests/ordered-assessments.integration.mjs` | Disposable database regression coverage for workflow, security and boundary behaviour. |
| `tests/recruitment-pipeline.integration.mjs` | Disposable database regression coverage for workflow, security and boundary behaviour. |
