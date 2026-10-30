# Aerotech Cloudflare staging — preparation only

This branch prepares an isolated Cloudflare Workers deployment. It has **not** been deployed. The production site, Cloudflare DNS, email routing, Vercel configuration, Neon production database, and billing credentials must remain unchanged.

## Deployment prerequisites

1. Validate the application in GitHub CI: build, lint, tests, signed-in portal journeys, cross-tenant authorization, payments, and API verification.
2. In a disposable CI environment, install compatible versions of `@opennextjs/cloudflare` and `wrangler`, then generate and commit a reviewed lockfile. Do **not** deploy without this dependency verification.
3. Run `npx opennextjs-cloudflare build`; review whether application Node.js dependencies and Next.js proxy can run in Workers. The Node.js-based route proxy and PostgreSQL driver are known compatibility audit points.
4. Create an **isolated staging Neon database** (not a branch that can write to production). Use test accounts only. Supply secrets via Cloudflare's secret store, never GitHub or static Wrangler vars.
5. Run `npx wrangler deploy -c wrangler.aerotech-staging.toml` only after successful build and isolated secrets/configuration. Cloudflare account must be selected explicitly.
6. Test employer, employee, applicant and support sessions; cross-company isolation; encrypted docs; WebRTC; cron; Paystack test-mode webhooks; redirects and security headers. Confirm no calls to live Paystack or the production Neon database.
7. Promote through a reviewed cutover plan only after staging passes and a rollback is prepared. Never switch the apex domain as part of staging.

## Security constraints

- Never use production `DATABASE_URL`, `PAYSTACK_SECRET_KEY`, `CRON_SECRET`, `RESEND_API_KEY`, or encryption keys in this staging environment.
- Do not enable production routes, DNS records, or production payment workflows.
- Prefer a private/access-controlled staging endpoint before any real data is permitted.
- Verify deployment output; Wrangler config alone is **not** proof of Cloudflare application compatibility.

Docs: https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/
