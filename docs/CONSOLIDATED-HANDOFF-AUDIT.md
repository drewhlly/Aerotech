# Aerotech consolidated handoff audit — 31 October 2026

This is an implementation checkpoint, not a completion or production verification certificate.

## Retained baseline

Repository: drewhlly/Aerotech. Last observed production deployment: bec8274d00a5c513dd441376220dc0fec33430c8, Vercel READY. Preserve the existing three portals, approved assets, database records, payroll review sequence and integrations.

## Observed gaps

| Area | Observed code or configuration | Status / next requirement |
| --- | --- | --- |
| Applicant identity | No NIN or SMS verification provider environment names found in production configuration | Authorised provider onboarding, consent, encryption, ownership verification, disputes and manual review must be implemented and tested. Do not claim one verified identity per person. |
| ATS assessments | /api/ats accepts answers during application creation; existing role assessment and scoring exist | Separate general and job-specific assessments; lock vacancy threshold before attempts; default 85%; accommodations, review and challenge flow remain. |
| CV processing | CV/document handling exists | Extraction, structured profile correction, duplicate detection and format-specific tests not verified. |
| Employee navigation | Recruitment and Salary payments links remain | Remove recruitment routes; move assigned approval responsibilities to permission-controlled My Approvals. Payment access and CEO release need coordinated redesign, not only hidden links. |
| Leave | Previously deployed page submits generic leave and shows no balance | Draft adds categories, annual allowance management, annual used-day query and legacy warnings. Full configurable policies, accrual, carryover, holidays, nonstandard workweeks, cancellation and attendance/payroll synchronisation remain. |
| Leave migration | Production Neon branch quota reached | Resolved for the leave-category migration: isolated test passed, approved production migration applied and recorded in the ledger. |
| Employee data | Tenant-aware query patterns exist | Full backend/API access matrix and cross-company tests remain. |
| Projects and tasks | Shared workspace with assignments and progress exists | Draft aligns header styling; dependencies, duplicate triggers and employer-to-employee delivery still require full workflow verification. |
| Confirmation | Confirmation queue and decision component both render page heroes | Draft removes second hero; decision feedback, probation/performance reminders and notification verification remain. |
| Notifications | Active/history and expiry handling already exists | Draft improves mobile wrapping. End-to-end delivery, expiry, unread state and notification idempotency need verification. |
| Aerochat | Tenant-scoped storage and five-second polling exist | Delivery issue has not been reproduced with two signed-in accounts; no resolution claimed. |
| Onboarding / workflow automation | Saved records, workflow settings and scheduler code exist | Full document/activation flow and idempotency tests remain. |
| Meetings | JaaS configuration is present | Configuration is not proof of working waiting rooms, access controls, participant attendance or consent. Test all requested controls. |
| Attendance / payroll | Existing modules and approval logic retained | No blanket functional certification. Verify real role-specific flows without executing production salary transfers. |

## Draft changes

- New nullable leave category column; existing historical requests remain unchanged and uncategorised.
- New employee leave API with server-side identity, tenant scope, category and date validation.
- Annual leave balance counts distinct approved weekdays within the current year. It does not deduct pending requests, calculate accrual/carryover or exclude holidays. Overlapping approved dates count once.
- HR can set current-year annual allowances only for employees in its own tenant.
- Employee leave page displays categories, request history, remaining annual allowance and an explicit legacy-review state.
- Dashboard leave action opens the dedicated page instead of an additional generic request form.
- People directory search; compact confirmation heading; project/task header alignment; mobile notification wrapping.

## Validation actually performed

- Lint: passed.
- Existing unit tests: 56 passed.
- Production build using webpack: passed.
- Default Turbopack build: failed opening its local persistent cache; webpack was used to confirm compilation.
- Local PGlite leave integration test: passed migration, balance query, tenant isolation, legacy warning and invalid-category constraint.
- No live applicant verification, two-assessment flow, signed-in desktop/mobile QA or salary transaction was performed.
- Application deployment is pending the limited release; the complete handoff remains unimplemented.

## Release checkpoint — approved limited release

The user authorised deployment of the tested leave-category migration and matching implementation. The approved preview database branch was deleted. The migration was tested on an isolated Neon branch, then applied to production with explicit approval and recorded in the migration ledger. The application release remains pending until the matching PR is merged and its production deployment is ready. This limited release does not certify the full consolidated handoff. The earlier observations below describe the audit state before this checkpoint.

## Remaining release gates for the full handoff

1. Expand leave from the draft annual calculation to employer-configurable policies, opening/accrual/pending/carryover and synchronisation.
2. Test schema on an isolated branch; resolve Neon branch quota with explicit permission before deleting any branch.
3. Run role/tenant, request validation, concurrent approval, idempotency, file security and browser tests.
4. Apply reviewed migration through the deployment ledger with approval, then release matching tested application commit.
5. Verify production with authorised test identities without using production employment decisions or salary transfers.
6. Implement and verify each remaining handoff requirement before marking it complete.
