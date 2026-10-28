# Phase 2 release repair — 28 October 2026

## Audit and plan

The combined release at `a355483` includes both parts. Its signed-in test schedules an interview tomorrow and immediately requests a token, contradicting the intentional 15-minute early-join window. Keep the server guard; verify early denial and update only the disposable fixture to an open window before testing token issuance and browser entry.

Carry forward the isolated Part 1 corrections omitted from the combined merge: preserve automated employer credential tracking without an Employee onboarding gate, strip retired onboarding fields from the Employee workflow response, and retain accessible contrast in the dark theme. Clear the document theme on leaving a signed-in workspace. Verify light and dark layouts with axe.

Run lint, TypeScript, unit tests, the complete disposable signed-in/browser/API/data suite, route isolation, authenticated and public Lighthouse checks and the collaboration integration suite. Stage the exact reviewed commit using the existing Aerotech Vercel project; promote after checks pass. No production fixture, provider payment, invitation email or schema replay is part of verification.

## Migration status

The production migration ledger already contains the legacy archive, job/privacy and collaboration migrations. This repair adds no migration. Existing production data and the combined projects, meetings, documents and search work are retained.

## Changed files

- `scripts/verify-signed-in.mjs`: test both the early interview denial and an invitation-scoped token inside the permitted join window.
- `src/lib/workflow-automation.ts`, `src/components/workflow-workspace.tsx`, `scripts/verify-phase2.mjs`: preserve HR credential automation, suppress the retired Employee onboarding fields and cover the boundary.
- `src/app/globals.css`, `src/components/employee-profile-workspace.tsx`, `src/components/workspace-tools.tsx`: dark contrast and portal-scoped theme cleanup, preserving combined search.
- `scripts/verify-portal-isolation.mjs`: add dark theme axe and screenshot evidence to the existing isolation checks.
- `docs/phase2/CHANGELOG.md`, `docs/phase2/REPAIR.md`: accurate migration status and repair scope.

## Verification

Results are recorded in the pull request and GitHub Actions artifacts after completion. Legal/company `[EDIT]` values and provider configuration limitations remain explicitly documented; passing synthetic tests does not claim real bank transfers or real camera/media sessions were exercised.

## Full-crawl findings resolved

The combined 159-page crawl identified native GET defaults on new collaboration forms. Meeting, project and document mutation forms now explicitly use POST while retaining authenticated JavaScript API handlers. The crawler now creates a tenant-owned project and Employee membership for valid project-detail coverage, instead of substituting an unrelated employee identifier. No route or API failure is suppressed.
