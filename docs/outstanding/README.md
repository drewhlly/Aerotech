# Leave and applicant workflow release — 31 October 2026

Baseline: production commit `3ead4833616aeb568852e8fdc44c6ea871dcdd50` (PR 61). This report tracks PR 62. Deployment status and final verification are recorded in the PR; do not treat a draft as deployed.

## Audit and implementation plan

| Area | Reproduced / inspected gap | Implementation |
| --- | --- | --- |
| Leave | Hard-coded Monday–Friday SQL; annual entitlement only | Shared calendar engine, eight category policies, holidays, employee overrides and opening adjustments |
| Accrual / carryover | No accrual or carryover configuration | Completed-calendar-month accrual; capped unused prior-year earned/opening entitlement; older carryover expires at year end |
| Reservations | Requests could exceed a configured balance | Optional balance enforcement under employee lock, checked again before approval |
| Calendar privacy | No permitted employee absence calendar | Own and direct-report approved leave, next 90 days; exclude reasons and categories |
| CV | Upload repeated per vacancy; no extraction or independent profile | Private applicant career profile, original PDF, optional extraction and mandatory applicant review |
| Assessment order | Applying included the job assessment; no separate general result | Reviewed profile/CV → general assessment → apply → job-specific assessment |
| Shortlisting | Scores did not enforce a vacancy threshold | Default 85%, employer-configurable before applications begin; automatically shortlist qualifying results |
| Fair review | No recorded override control | Below-threshold advancement requires an audited job-related human review; incomplete role assessments cannot advance |
| Scoring integrity | Current job questions could change an application’s assessment | Snapshot question bank, threshold, general score and reviewed professional profile at submission |
| Retries | Assessments needed explicit replay controls | Row locking, one scored attempt, identical retry returns success without another event |
| Recruiter focus | Default view included all active applicants | Default shortlist; retain To review / All stages access |
| Screening report | No structured candidate workbook | Tenant-authorised XLSX report with scores, criteria, profile and human-review details |
| Identity claims | No configured identity/phone ownership verification | Do not collect NIN or claim verification; show self-reported status and retain support/manual review routes |

Preserve historical applications with a null assessment policy: they retain their original workflow. No historical score is recalculated. Existing annual employee allowances are retained and override company defaults until explicitly changed.

## Policy semantics

- No statutory entitlement is assumed. HR must configure lawful policy and approved questions.
- Monthly accrual credits completed calendar months from the hire month; no daily proration. Fractional balances round to two decimals.
- Individual entitlements override company category defaults. Existing annual overrides remain effective.
- Public holidays must be entered by HR for the selected year; no automatic holiday feed is claimed.
- Carryover is capped unused prior-year earned/opening entitlement; older carried balances expire at year end. Missing prior entitlement yields no assumed carryover. Legacy uncategorised approved leave requires HR reconciliation.
- Pending requests reserve working days. Rejected requests do not reduce balances. Approved future days are already reserved.
- Enforcement is opt-in, preserving previous company behaviour until HR configures it. No balance is invented for an unconfigured category.
- Dates follow the existing Africa/Lagos calendar. Multiple company timezones and alternate accrual methods remain future work.
- Leave is not automatically deducted from salary; payroll approval controls remain unchanged.

## Recruitment semantics and limits

- Supported CV format in this release: PDF, maximum 2 MB; extraction limit 30 pages / 100,000 text characters. Extraction recognises explicit skills/employment/education headings without inventing content. Blank, scanned or unusual files can be entered manually.
- The reviewed profile and original CV are shared only when the applicant explicitly consents to an application. Editing the private profile does not rewrite submitted applications.
- Question banks are starter content, not independently validated psychometric tests. Employers must review job-specific questions against published requirements; no protected traits are used for grading.
- Scores use equally weighted correct answers. The general result is separate from the vacancy threshold.
- Human review reasons are internal and audited; applicant APIs remove answer keys, submitted answers and internal override reasons.
- Keyword matches and identical-file hints do not determine scores, prove identity, or automatically reject people.
- Employers must record interview feedback before offering/hiring in the new ordered workflow. Existing private Aerotech meeting rooms and employer-controlled onboarding are retained.
- **Still outstanding:** authorised live identity/NIN and phone ownership verification; verified one-person identity matching/recovery/disputes; independently validated question banks; full self-service interview availability/calendar integration; automatic activation-email delivery after hire and complete provider-backed interview acceptance checks. Do not advertise these as complete.

## Migration / data integrity

`database/043_leave_and_assessment_policies.sql` is additive: three new tables and two new columns, no deletes or historical rewrites. It is registered in the existing checksum-ledger migration runner. Verify against the PR preview database before applying transactionally to main. Compare employee/request/application counts and historical application/request digests before/after. Keep migration 042 unchanged.

The isolated Vercel preview branch for this PR is `br-damp-water-b8edvo8a` in production project `polished-cloud-66634472`; main remains `br-empty-base-b84a9xdp`. No branch deletion is part of this release.

## Verification commands

- `npm test`
- `npm run test:integration`
- `npm run lint`
- `npm run build`
- `npx tsc --noEmit`
- `AUTOMATION_BROWSER_SCRIPT=scripts/verify-recruitment-leave.mjs node scripts/automation-browser-suite.mjs` with the local Chromium runtime.
- `npm run test:api:invalid-input` uses disposable localhost data only.

Evidence and final counts are appended to the PR after the last source change. Production smoke tests must be read-only; do not create live test candidates or manipulate production employee records.

## Manual QA

1. HR: configure annual and sick policy, workweek, holidays, accrual/carryover; save an individual override.
2. Employee: verify all category balances, pending reservations, calendar scope and unavailable-balance messages. Submit a permitted request; test a disabled category and over-balance request.
3. Manager/HR: review a pending request after policy changes; confirm revalidation and one decision notification.
4. Applicant: upload a PDF, extract sections, correct missing data, confirm consent/review and save. Try scanned PDF/manual entry.
5. Complete general skills once; apply with consent; complete the separate role assessment. Check shortlist at/above threshold and review status below it.
6. HR: attempt below-threshold advancement without/with a meaningful review reason; verify no advance before incomplete assessment or offer before interview feedback.
7. Download screening XLSX; check no other tenant’s application can be fetched. Check applicant cannot read internal review reasons or answer keys.
8. Check 360/768/1280 layouts, keyboard navigation, labels, notifications and role-isolated links.
9. Confirm production commit/domain, protected redirects, unauthenticated API denial and runtime error scan after deployment.

## Verified release checks

- 58 unit tests passed.
- 25 integration suites passed, including real-PDF extraction, ordered assessments, screening workbook, leave policy calculations and calendar privacy.
- Build, ESLint (zero warnings/errors) and `tsc --noEmit` passed after the UI changes.
- 2,125 malformed-input HTTP checks across 85 exported route/method combinations, five roles and five body shapes: zero unhandled 500s. Fixture-only unavailable integrations remain signed billing/payment webhooks and facial enrolment with no provider; these stay fail-closed.
- Browser-to-database flows passed private CV extraction/review, general assessment, consented application, job assessment, 85% shortlist, HR report link, policy save and employee balances.
- 360/768/1280 layouts, no page errors and no serious/critical axe findings on tested pages. HR allowance lists are searchable and paginated; employee annual balance duplication removed.
- Migration 043 tested twice on the preview and applied transactionally to main. Three tables/two columns verified, no historical application re-scoring, expected ledger checksum `2a3cce5d5b13900951e59b5acd81f12269b06e6532af806f36f557c7531728c4`.
- Before/after production preservation checks matched: 11 employees, four applications, zero leave requests; historical application and request digests unchanged. No live test identities created.
- Lighthouse and the deployment’s live smoke/runtime checks are recorded separately in the final PR report.

## Files changed

| File | Purpose |
| --- | --- |
| `database/043_leave_and_assessment_policies.sql` | Add policy/profile storage and snapshot/threshold columns without historical rewrites. |
| `docs/outstanding/README.md` | Release audit or compact verification evidence. |
| `docs/outstanding/evidence/browser-results.json` | Release audit or compact verification evidence. |
| `docs/outstanding/evidence/invalid-input-summary.json` | Release audit or compact verification evidence. |
| `docs/outstanding/evidence/lighthouse.json` | Release audit or compact verification evidence. |
| `package-lock.json` | Lock dependency resolution. |
| `package.json` | Pin serverless PDF extraction dependency. |
| `scripts/automation-browser-suite.mjs` | Allow a selected browser suite and optional targeted Lighthouse run. |
| `scripts/lighthouse-outstanding.mjs` | Measure the three new portal screens with synthetic authenticated sessions. |
| `scripts/migrate.mjs` | Register additive migration 043. |
| `scripts/verify-recruitment-leave.mjs` | Disposable browser-to-database checks and responsive/axe verification. |
| `src/app/api/applicant/profile/route.ts` | Protect private CV/profile, extraction, one-attempt general assessment and own-file download. |
| `src/app/api/ats/route.ts` | Enforce ordered assessments, snapshot criteria, score shortlists and audit review exceptions. |
| `src/app/api/employee/manager/leave/route.ts` | Check assigned manager scope and revalidate before approval. |
| `src/app/api/hr/leave-balances/route.ts` | Save category/year entitlements and opening adjustments under employee lock. |
| `src/app/api/hr/leave-policy/route.ts` | Validate, store and audit tenant leave policies. |
| `src/app/api/hr/requests/[id]/review/route.ts` | Revalidate leave policy/balance before HR approval. |
| `src/app/api/leave/route.ts` | Return shared calculated balances and the permitted absence calendar. |
| `src/app/api/privacy/export/route.ts` | Include the applicant’s own career data without answer keys. |
| `src/app/api/recruitment/report/route.ts` | Tenant-protected JSON/XLSX screening report with reviewable hints. |
| `src/app/applicant/profile/page.tsx` | Add the portal-internal career profile route. |
| `src/app/dashboard/employer/leave-policies/page.tsx` | Category/year/opening controls, policy editor, searchable paginated allowances. |
| `src/app/employee/leave/page.tsx` | Show all category balances and scoped calendar; remove repeated annual summary. |
| `src/components/applicant-career-profile.tsx` | Accessible CV extraction/review, consent and general assessment UI. |
| `src/components/applicant-nav.tsx` | Link career profile inside the applicant portal. |
| `src/components/employer-recruitment.tsx` | Prioritise shortlist without hiding review/history access. |
| `src/components/leave-policy-editor.tsx` | Working-day/holiday, entitlement, accrual, carryover and enforcement controls. |
| `src/components/recruitment-candidate-review.tsx` | Show both scores/threshold, internal exception reason and report download. |
| `src/components/recruitment-workspace.tsx` | Separate applying from job assessment and expose vacancy threshold. |
| `src/lib/ats.ts` | Extend response types with policy and general-score fields. |
| `src/lib/cv-extraction.ts` | Bounded PDF extraction with manual fallback and resource cleanup. |
| `src/lib/cv-profile.ts` | Literal section detection and non-scoring requirement-term hints. |
| `src/lib/leave-calculations.ts` | Tenant/year data loading and approval reservation revalidation. |
| `src/lib/leave-dates.ts` | Share safe date/category validation between server and client. |
| `src/lib/leave-policy.ts` | Pure policy validation and auditable calendar/accrual/carryover calculations. |
| `src/lib/leave-requests.ts` | Use policy calendars and optional balance checks at all submission entry points. |
| `src/lib/recruitment-query.ts` | Return minimal assessment summary without answer keys/internal notes. |
| `src/lib/recruitment-screening.ts` | Validate and sanitise immutable assessment policy; qualify scores. |
| `src/lib/route-metadata.ts` | Name the new private career profile route. |
| `tests/cv-extraction.integration.mjs` | Regression coverage for cv extraction. |
| `tests/leave-api.integration.mjs` | Regression coverage for leave api. |
| `tests/leave-balance.integration.mjs` | Regression coverage for leave balance. |
| `tests/leave-calendar.integration.mjs` | Regression coverage for leave calendar. |
| `tests/leave-policy.integration.mjs` | Regression coverage for leave policy. |
| `tests/ordered-assessments.integration.mjs` | Regression coverage for ordered assessments. |

## Targeted Lighthouse results

Local production build, signed-in disposable fixtures: applicant profile Performance 98 / Accessibility 100 / Best Practices 100; employee leave 99 / 100 / 100; HR leave policies 98 / 100 / 100. CLS is zero on all three. Portal SEO is 69 because these routes intentionally use noindex. Employee leave initially measured Performance 82 and CLS 0.369; reserved loading cards removed the layout shift. See `evidence/lighthouse.json`. These are lab measurements, not production field Core Web Vitals.
