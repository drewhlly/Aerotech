# Vercel preview provisioning diagnosis — 18 November 2026

## Observed facts
- Vercel project `aerotech` (`prj_Ky7CNbWXdStGTBPLqe3cdkbD9nba`) uses the Next.js framework preset and Node.js 24.x.
- Preview deployments of multiple unrelated Git commits fail as `BUILD_FAILED: Resource provisioning failed` before yielding useful application build events.
- Example: `dpl_A5B5Wk8N9NME6dzpJQejAjBnGKC9`, attendance PR #82.
- GitHub Actions can install dependencies, lint, execute tests and build the Next.js application. This is evidence against a universal source compilation failure; it does not establish successful Vercel resource provisioning.
- A Neon marketplace integration is installed, while its Vercel integration configuration reported no projects selected. Database-related environment variable names were present for preview and production, but no secret values were exposed in this audit.
- **The specific failing Vercel resource is not exposed through the available deployment events. Do not claim that Neon is definitively the root cause without the platform-side provisioning detail.**

## Settings checklist (Vercel dashboard)
1. Open the **aerotech** project, **Settings → General**. Confirm **Framework Preset = Next.js**, **Root Directory = ./ (repository root)**, **Build Command = default / npm run build**, **Output Directory = default**, **Node.js Version = 24.x**. Save changes only when they differ.
2. Under **Settings → Environment Variables**, compare **Preview** and **Production** scopes. Configure required server-side `DATABASE_URL` for preview with an **isolated, non-production database**; verify its connection target without exposing the password. Public canonical/analytics values use `NEXT_PUBLIC_` only when safe for browsers. Do not put Paystack live keys or production personal information in preview.
3. Under **Integrations / Marketplace → Neon**, inspect whether the resource associated with Aerotech exists, is healthy, and is assigned to the Aerotech Vercel project for Preview. Review the integration event/error details before reconnection. **Do not delete a Neon project, rotate production credentials or associate the separate Cloudflare staging project by assumption.**
4. Review project deployment logs and account/team deployment limits or billing/resource provisioning notices. If errors persist without build events, provide the deployment ID to Vercel support and request the failing resource-provisioning event.
5. Rerun the failed preview only after the environment/resource change. Require `READY` and authenticated attendance checks before any production promotion.
6. Preserve the existing production domain alias and rollback candidate throughout.

## Reproducible developer commands
```bash
node --version  # Node 24.x
npm ci --no-audit --no-fund
node scripts/audit-environment.mjs
npm run lint
npm test
npm run test:integration
npm run build    # next build --webpack
npx tsc --noEmit
```

The command sequence is now part of CI; the connected execution container cannot clone this repository directly for a separate local terminal run. CI and Vercel platform provisioning are separate gates.
