# Aerotech release reliability runbook

## Authority and safety
- Cloudflare is the intended production platform, but **do not change DNS, routes, or disable Vercel until the live Worker, rollback, background jobs, and critical journeys are verified**.
- Treat Vercel as an existing deployment target/rollback option until cutover evidence exists. Do not bypass required GitHub or Vercel checks.
- Never print secrets, copy production credentials to previews, or run a production migration as part of pull-request CI.
- Require an approved release window and backup/restore evidence before schema changes or production cutover.

## Development and staging
- Use a stable isolated Neon staging project/database with separate credentials and no production data.
- Preview database branching must be explicitly controlled. The existing Vercel Neon integration can create per-branch databases and fail when the Neon branch quota is reached.
- Inventory branches and owners before deleting any. A branch is only eligible for retirement after the associated PR is closed, no deployed Worker uses it, and the owner confirms retention requirements. **Do not automate destructive deletion.**
- Use locked npm installs (`npm ci`) and Node 24 in CI. Require lint, unit/integration tests, production build, typecheck, and migration registration checks.
- Cloudflare's vinext is currently beta; perform compatibility and runtime checks in isolated staging before adopting it for production. Existing OpenNext setups should be verified rather than replaced blindly.

## Release gate
1. Merge only after all required checks are successful and the deployment provider has produced a working preview. A missing or provisioning-failed preview is not a green check.
2. Verify staging PostgreSQL connection, migration ledger, auth for employer/employee/applicant, tenant isolation, billing, attendance, recruitment, payroll, email, and background tasks.
3. Before production, document the current Worker version, database backup point, routes, scheduled jobs, and rollback command.
4. Promote the verified artifact with explicit approval. Run read-only smoke tests immediately after release.
5. If release fails, revert traffic to the last known-good deployment and investigate without live patching. Database rollback is a separate decision.

## Troubleshooting: Vercel + Neon
- For `BUILD_FAILED: Resource provisioning failed`, inspect Deployment > Provisioning Integrations first. An empty build log means the build might never have started.
- Check the Neon integration's selected project, branch quota, preview branch creation, and integration permissions. Never install a duplicate database to mask the failure.
- Confirm whether the Vercel check is required by branch protection before changing any deployment wiring.
- Maintain a daily report of failed/pending checks and deployments; alerts must not claim a deployment succeeded until verified.

## Manual activation checklist
- [ ] Confirm the current production Cloudflare Worker and associated DNS route.
- [ ] Confirm staging secrets and database isolation without displaying values.
- [ ] Verify Cloudflare build and runtime compatibility.
- [ ] Verify rollback route and scheduled-job ownership.
- [ ] Review branch protection and decide how Vercel should participate in releases.
- [ ] Only then authorise production pipeline switch.
