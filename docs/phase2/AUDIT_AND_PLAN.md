# Phase 2 Part 1 — Audit and implementation plan

Audited baseline: `8a3e47924bfea7706fabbf51f2d4e82ba2551e49` (production main, 27 October 2026).

## Audit

- New vacancies were forced to draft by `/api/ats`, and employer publication explicitly returned 403. Approval UI/API/metadata/schema remained.
- Employee onboarding/agreement navigation, page, acknowledgement API branch, scheduled task creation and notification were connected; deleting the page alone would leave dependencies.
- Phase 1 provides isolated role layouts, navigation and middleware; same-origin and tenant checks must be preserved.
- App shell lacked desktop collapse, command navigation, themes and reusable table interactions. Employee directory used an unpaginated linked list.
- Privacy and Terms were short notices, without rights handling, versioned registration acceptance or granular cookie logs.
- About information supplied in this request was empty. Existing mission/story/values cannot be represented as approved facts under the new brief.
- Baseline build, lint, TypeScript and all 33 tests passed.

## Plan shown to owner before large changes

1. Replace pre-publication approval with immediate publication, validation, screening, account rate limits, reports, expiry and public discovery.
2. Retire Employee agreement/onboarding entry points without removing employer staff administration.
3. Extend shared components, role shells, tables, fixed-value controls, loading/error states and dashboard attention widgets.
4. Version policies and acceptance, add privacy settings/requests/export/cookies and admin audit workflow; mark unprovided facts `[EDIT]`.
5. Verify in disposable PostgreSQL/Chromium, then build/lint/types, role crawl, axe and Lighthouse before release.

## Deliberate boundaries

- Historical migrations remain as migration history; the new forward migration removes obsolete runtime fields. Historical signed acknowledgement evidence is retained, inaccessible through the retired workflow, pending an approved retention policy.
- Deletion is a tracked, confirmed request, not immediate erasure of employer-controlled payroll/legal records. It requires verified identity and a documented retention decision. Account export states its scope; additional records can be requested.
- Company verification is distinct from vacancy review. Only an administrator can record independent company identity evidence; a verified email alone does not produce the badge.
- Optional analytics and advertising are not installed or activated by the cookie UI. All optional categories default off.
- No project/task functionality is introduced in Part 1; dashboard slots are explicitly reserved for Part 2.
- No production domain/DNS changes are included.

## Legal sources checked

- NDPC NDP Act 2023 resource: https://ndpc.gov.ng/download/nigeria-data-protection-act-2023
- NDPC 2026 journal explaining GAID 2025: https://ndpc.gov.ng/wp-content/uploads/2026/02/NDPC-Journal-2026-1.pdf
- NDPC rights and implementation FAQs: https://ndpc.gov.ng/faqs/

Drafts require a qualified Nigerian data-protection professional to validate entity/DPO contacts, lawful bases, subprocessors, transfer safeguards, retention schedules and adoption date. They are not a compliance certification.

## Safe migration rollout

The runner now records checksums in `schema_migrations` and applies each SQL file once under a transaction/advisory lock. An existing database without this ledger fails closed rather than replaying old migrations. After verifying production is at migration 036, adopt it with `node scripts/migrate.mjs --baseline-through=036_password_recovery.sql`; this records historical checksums without executing them and applies 037. A subsequent normal run skips all applied files. Do not baseline an unverified schema. Migration 037 is transaction-safe and handles an already-removed legacy approval column.

Migration 037 has been exercised only against disposable CI PostgreSQL; no production migration has been applied yet. Release must coordinate the schema update and application version because retired columns are incompatible with the old recruitment API.

## Verification refinement

Public pages passed Lighthouse with performance 96–100 and 100 for accessibility, best practices and SEO. Authenticated checks found Employee dashboard layout shift of 0.449 despite a 0.7s LCP and no blocking time. Attention panels now preserve their loading/loaded geometry; the Employee heading also stays stable. The private quality gate retains the 90-point budget and adds CLS <=0.1. The full route crawl now exercises the already-built production server rather than a separate development server, covering the deployment runtime directly.

Migration review also preserves already-closed vacancies even if an obsolete approval flag says pending. Only pending drafts and legacy open/pending lifecycle values are published.
