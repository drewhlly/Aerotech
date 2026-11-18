# Aerotech environment variable inventory

Generated from the repository environment reference audit on 18 November 2026. Template presence was reconciled against the latest `.env.example`. Values are not included. This enumerates direct dotted references in `src/`, `scripts/` and `tests/`, plus build config. Dynamic bracket-indexed references require separate manual review.

**Interpretation:** `public/build` must be configured before building the client; `build/config` is read by Next.js during configuration; `server/runtime` is needed only when the corresponding server route or test runs. `MISSING` means absent from the example template—not necessarily missing from Vercel or required in every environment. Node, browser and CI-provided variables should not be manually set as secrets.

| Variable | Phase | Referencing files | In `.env.example` |
|---|---|---|---|
| `APP_BASE_URL` | server/runtime | scripts/verify-dashboard-states.mjs, scripts/verify-landing-motion.mjs, scripts/verify-phase2.mjs, scripts/verify-portal-isolation.mjs, scripts/verify-portal-quality.mjs, scripts/verify-public-routes.mjs, scripts/verify-pwa.mjs, scripts/verify-route-crawl.mjs, scripts/verify-signed-in.mjs, src/app/api/admin/readiness/route.ts, src/app/api/billing/route.ts, src/app/api/recruitment/calendar/route.ts, src/app/api/support-console/tickets/[id]/diagnostics/route.ts, src/lib/activation-delivery.ts, src/lib/collaboration-worker.ts, src/lib/interview-delivery.ts, src/lib/support-session.ts, tests/activation-delivery.integration.mjs | yes |
| `AUTOMATION_BROWSER_SCRIPT` | server/runtime | scripts/automation-browser-suite.mjs | yes |
| `AWS_ACCESS_KEY_ID` | server/runtime | src/lib/face-attendance.ts | yes |
| `AWS_REGION` | server/runtime | src/lib/face-attendance.ts | yes |
| `AWS_SECRET_ACCESS_KEY` | server/runtime | src/lib/face-attendance.ts | yes |
| `CHROME_PATH` | server/runtime | scripts/lighthouse-interviews.mjs, scripts/lighthouse-outstanding.mjs, scripts/phase2-lighthouse.mjs, scripts/verify-automation-workflows.mjs, scripts/verify-collaboration.mjs, scripts/verify-communications-ui.mjs, scripts/verify-consolidated-workflows.mjs, scripts/verify-interview-activation.mjs, scripts/verify-recruitment-leave.mjs | yes |
| `CLOUDFLARE_AI_ACCOUNT_ID` | server/runtime | src/app/api/ai/ask/route.ts, tests/ai-api.integration.mjs, tests/ai-cloudflare.integration.mjs | yes |
| `CLOUDFLARE_AI_TOKEN` | server/runtime | src/app/api/ai/ask/route.ts, tests/ai-api.integration.mjs, tests/ai-cloudflare.integration.mjs | yes |
| `CRAWL_MODE` | server/runtime | scripts/verify-route-crawl.mjs | yes |
| `CRON_SECRET` | server/runtime | src/app/api/cron/hr-birthdays/route.ts, src/app/api/cron/payroll/route.ts, src/app/api/cron/payslip-notices/route.ts, src/app/api/cron/workflows/route.ts, src/app/api/jobs/report/route.ts, src/lib/scheduler-auth.ts, tests/workflow-scheduler.integration.mjs | yes |
| `DATABASE_URL` | server/runtime | scripts/enable-support-enrollment.mjs, scripts/migrate-support.mjs, scripts/migrate.mjs, scripts/provision-support-agent.mjs, scripts/verify-dashboard-states.mjs, scripts/verify-phase2.mjs, scripts/verify-portal-isolation.mjs, scripts/verify-portal-quality.mjs, scripts/verify-public-routes.mjs, scripts/verify-route-crawl.mjs, scripts/verify-signed-in.mjs, src/app/api/admin/readiness/route.ts, src/app/api/auth/login/applicant/route.ts, src/app/api/auth/logout/applicant/route.ts, src/app/api/auth/logout/route.ts, src/app/api/auth/signup/applicant/route.ts, src/app/api/auth/signup/employer/route.ts, src/lib/applicant-session.ts, src/lib/employer-session.ts, src/lib/public-jobs.ts, tests/ai-api.integration.mjs, tests/ai-cloudflare.integration.mjs, tests/collaboration-api.integration.mjs, tests/subscription-access.integration.mjs, tests/subscription-billing.integration.mjs | yes |
| `DOCUMENT_ENCRYPTION_KEY` | server/runtime | src/lib/activation-delivery.ts, src/lib/document-crypto.ts, src/lib/meeting-guest.ts, tests/activation-delivery.integration.mjs, tests/collaboration-api.integration.mjs, tests/collaboration.test.mjs, tests/completion.test.mjs | yes |
| `DOCUMENT_SCAN_TOKEN` | server/runtime | src/lib/collaboration-worker.ts | yes |
| `DOCUMENT_SCAN_URL` | server/runtime | src/lib/collaboration-worker.ts | yes |
| `INTERVIEW_LIGHTHOUSE` | server/runtime | scripts/automation-browser-suite.mjs | yes |
| `INVITATION_FROM_EMAIL` | server/runtime | src/app/api/admin/readiness/route.ts, src/app/api/auth/password/route.ts, src/app/api/communications/announcements/route.ts, src/app/api/employer/verification/route.ts, src/app/api/support-console/tickets/[id]/diagnostics/route.ts, src/lib/activation-delivery.ts, src/lib/collaboration-worker.ts, src/lib/communication-worker.ts, src/lib/interview-delivery.ts, src/lib/invitation-email.ts, src/lib/registration-welcome-email.ts, tests/activation-delivery.integration.mjs, tests/collaboration-api.integration.mjs, tests/communications.integration.mjs | yes |
| `JAAS_APP_ID` | server/runtime | src/app/api/meet/[id]/details/route.ts, src/app/api/meet/[id]/join/route.ts, src/app/api/support-console/tickets/[id]/diagnostics/route.ts, src/lib/meeting-provider.ts, tests/meeting-provider.test.mjs | yes |
| `JAAS_KEY_ID` | server/runtime | src/app/api/meet/[id]/join/route.ts, src/app/api/support-console/tickets/[id]/diagnostics/route.ts, src/lib/meeting-provider.ts, tests/meeting-provider.test.mjs | yes |
| `JAAS_PRIVATE_KEY` | server/runtime | src/app/api/meet/[id]/join/route.ts, src/app/api/support-console/tickets/[id]/diagnostics/route.ts, src/lib/meeting-provider.ts, tests/meeting-provider.test.mjs | yes |
| `JITSI_APP_ID` | server/runtime | src/app/api/meet/[id]/join/route.ts, src/app/api/support-console/tickets/[id]/diagnostics/route.ts, tests/collaboration-api.integration.mjs | yes |
| `JITSI_APP_SECRET` | server/runtime | src/app/api/meet/[id]/join/route.ts, src/app/api/support-console/tickets/[id]/diagnostics/route.ts, tests/collaboration-api.integration.mjs | yes |
| `JITSI_DOMAIN` | build/config,server/runtime | next.config.ts, src/app/api/meet/[id]/join/route.ts, src/app/api/support-console/tickets/[id]/diagnostics/route.ts, tests/collaboration-api.integration.mjs | yes |
| `JITSI_JWT_SUB` | server/runtime | src/app/api/meet/[id]/join/route.ts | yes |
| `LD_LIBRARY_PATH` | server/runtime | scripts/phase2-lighthouse.mjs, scripts/verify-collaboration.mjs | MISSING |
| `NEXT_PUBLIC_CANONICAL_URL` | public/build | scripts/verify-public-routes.mjs, src/lib/seo.ts | yes |
| `NEXT_PUBLIC_CLIENTS_SERVED` | public/build | src/components/credibility-stats.tsx | yes |
| `NEXT_PUBLIC_PROFESSIONALS_PLACED` | public/build | src/components/credibility-stats.tsx | yes |
| `NEXT_PUBLIC_SITE_URL` | public/build | src/lib/collaboration-worker.ts | yes |
| `NEXT_PUBLIC_YEARS_IN_BUSINESS` | public/build | src/components/credibility-stats.tsx | yes |
| `NODE_ENV` | build/config,server/runtime | next.config.ts, src/app/api/privacy/cookies/route.ts, src/app/api/support-console/enroll/route.ts, src/app/api/support-console/login/route.ts, src/components/install-app.tsx, src/lib/applicant-session.ts, src/lib/employee-auth.ts, src/lib/employer-session.ts, src/lib/portal-selection.ts | MISSING |
| `OPENAI_API_KEY` | server/runtime | src/app/api/admin/readiness/route.ts | yes |
| `OUTSTANDING_LIGHTHOUSE` | server/runtime | scripts/automation-browser-suite.mjs | yes |
| `PAYOUT_ENCRYPTION_KEY` | server/runtime | scripts/verify-signed-in.mjs, src/app/api/admin/readiness/route.ts, src/app/api/payroll/payments/connection/route.ts, src/lib/paystack-payouts.ts, tests/payout-api.integration.mjs | yes |
| `PAYSTACK_SECRET_KEY` | server/runtime | scripts/verify-paystack-live.mjs, src/app/(public)/pricing/page.tsx, src/app/api/billing/route.ts, src/app/api/billing/webhook/route.ts, src/lib/billing.ts, tests/subscription-billing.integration.mjs | yes |
| `PHASE2_LIGHTHOUSE` | server/runtime | scripts/automation-browser-suite.mjs, scripts/consolidated-browser-suite.mjs, scripts/invalid-input-suite.mjs, scripts/phase2-browser-suite.mjs | yes |
| `PHASE2_TEST_ORIGIN` | server/runtime | scripts/verify-collaboration.mjs | yes |
| `PORTAL_ROOT_DOMAIN` | server/runtime | src/proxy.ts | yes |
| `PWA_CHROME` | server/runtime | scripts/verify-pwa.mjs | yes |
| `QA_CHROME` | server/runtime | scripts/verify-dashboard-states.mjs, scripts/verify-portal-isolation.mjs, scripts/verify-public-routes.mjs, scripts/verify-route-crawl.mjs, scripts/verify-signed-in.mjs | yes |
| `REPORT_HASH_SECRET` | server/runtime | src/app/api/jobs/report/route.ts | yes |
| `RESEND_API_KEY` | server/runtime | src/app/api/admin/readiness/route.ts, src/app/api/auth/password/route.ts, src/app/api/communications/announcements/route.ts, src/app/api/employer/verification/route.ts, src/app/api/support-console/tickets/[id]/diagnostics/route.ts, src/lib/activation-delivery.ts, src/lib/collaboration-worker.ts, src/lib/communication-worker.ts, src/lib/interview-delivery.ts, src/lib/invitation-email.ts, src/lib/registration-welcome-email.ts, tests/activation-delivery.integration.mjs, tests/collaboration-api.integration.mjs, tests/communications.integration.mjs | yes |
| `SUPPORT_EMAIL` | server/runtime | src/lib/support-contact.ts | yes |
| `SUPPORT_INITIAL_AGENT_EMAIL` | server/runtime | scripts/enable-support-enrollment.mjs, src/app/api/support-console/enroll/route.ts | yes |
| `SUPPORT_MFA_ENCRYPTION_KEY` | server/runtime | scripts/test-support-enrollment.mjs, scripts/test-support-flow.mjs, src/lib/support-security.ts, tests/support-security.test.mjs | yes |
| `SUPPORT_PHONE` | server/runtime | src/lib/support-contact.ts | yes |
| `SUPPORT_TEST_DEPENDENCIES` | server/runtime | scripts/test-support-enrollment.mjs, scripts/test-support-flow.mjs | yes |

## Verification

```bash
node scripts/audit-environment.mjs
npm ci --no-audit --no-fund
npm run lint
npm test
npm run test:integration
npm run build
npx tsc --noEmit
```

### Vercel readiness

- Framework Next.js, repository root `/`, Node.js 24.x, build `npm run build`, no custom Output Directory.
- Configure only required environment variables for **Preview** and **Production** separately. Do not copy production data or secrets into public variables.
- Validate the Neon integration's resource/project assignment, particularly preview provisioning, before retrying a deployment.
- Preview provision errors without any build events must be diagnosed in Vercel's integration/resource provisioning, not blamed on code compilation without further evidence.
