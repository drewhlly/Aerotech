# Combined Phase 2 production release

28 October 2026

Combines Part 1 `7e0779ba36970124c7d36a8a3424203496a574b1` and Part 2 `6bf07001f85bf140467934c02ffa2e6bc2ca5d30`. The release preserves immediate job publication, legal/privacy controls and shared components, plus projects/tasks, scalable meeting invitations, versioned documents, the approved logo and redesigned entry pages.

Resolved overlapping dashboards, portal navigation, command-palette search, route isolation and migration registration. Navigation and permission-aware resource search share one keyboard palette. Retired routes remain deleted. The collaboration worker now expires published jobs using the Part 1 lifecycle. `verify-collaboration.mjs` preserves the Part 2 browser suite alongside Part 1’s `verify-phase2.mjs`.

## Validation

- 45 unit tests passed.
- 21 isolated API-handler checks passed.
- 15 browser checks passed, including the combined privacy/resource command palette, 1,000-person invitations, portal denials and mobile overflow.
- TypeScript, lint and the local production webpack build passed.
- A disposable database verified the release migration, historical-note archive, migration-ledger adoption and replay behavior preserving draft jobs.

The new `037_phase2_legacy_archive.sql` preserves retired configuration, approval notes and relevant acknowledgement records before the Part 1 migration removes the old fields/guards. The release adopts the verified existing migrations through `036_password_recovery.sql` into the checksum ledger; it then applies the archive, job/privacy and collaboration migrations in order. Existing collaboration tables are retained by the idempotent migration. Do not replay historical migrations on the live schema.

## Deployment target

Existing Vercel project `aerotech`; existing Neon production branch `main`. Public target: https://aerotech-psi.vercel.app. The separate production builds of Parts 1 and 2 are superseded only after this combined build is verified. The preferred brand domain `aerotechhr.app` is not connected to this Vercel project.

The document encryption key is configured in production without exposing its value. Malware scanning and the opt-in external scheduler remain unconfigured; files remain quarantined and automatic queue processing is inactive. External guests, certified e-signatures, complete translation/Unicode PDF support and remaining pagination controls retain the limitations documented in `review.md`.

For application rollback after the job lifecycle migration, use the Part 1 production deployment `dpl_Gw7b9uatbQt44FY9YA3BQCvmfJnu`, which supports the new job statuses. Keep the additive tables and historical archive; do not reset the database or roll back to a version that only understands `open` jobs.
