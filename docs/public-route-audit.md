# Aerotech public-route audit

Status: implementation and automated verification in progress. Final evidence is recorded in the release section below.

## Scope and design decisions

- `/careers` is the public canonical jobs list. `/jobs` and legacy detail links return a permanent 308 redirect. Full details and applying require an applicant session. Public API responses contain summaries only.
- The list uses ItemList structured data. JobPosting is limited to the signed-in single-job page, where its description is visible. This intentionally gated page is not eligible for Google job rich results; public full descriptions would be needed for that.
- Auth, recovery, help and private job-detail pages intentionally use noindex. Metadata descriptions are 140–160 characters; canonical recovery URLs exclude tokens.
- Online subscription checkout remains disabled until a live Paystack merchant key is configured. Supported published prices are NGN and USD; other regional currencies clearly require a quote.
- Contacts reuse the existing Aerotech business email and phone, normalised to +234. Email ownership, phone reachability and recovery-email inbox delivery were not independently verified.
- CSP retains inline script/style allowance for Next.js static hydration. It blocks object embedding, framing and unapproved third-party scripts; it is not a nonce-based strict CSP. Existing in-app meetings retain their configured domain permissions.
- ESLint was previously empty. Real Next.js/TypeScript checks now run; legacy compiler/style findings are warnings so this audit does not require unrelated portal rewrites.

## Verification

- Production webpack build and TypeScript: passed locally.
- Unit/smoke tests: 32 passed.
- Current project-source credential pattern scan: no private-key, provider-key, GitHub-token or external database-password matches. This is not a full git-history or dependency secret audit.
- CI uses disposable PostgreSQL and generated passwords; no production payments or real user credentials are used.
- Every listed public/auth route is checked at 360, 768 and 1280 pixels for metadata, overflow, visible images, keyboard navigation and working mobile navigation.
- Public-page links are resolved with no accidental redirect chains; solution CTAs preserve their intended protected destination through login.
- Signed-in checks cover each role, tenant isolation, wrong-password validation, toggles/loading, checkout returns, support ticket confirmation and single-use recovery/session invalidation.
- Automated WCAG AA checks and Lighthouse mobile reports are attached to the GitHub signed-in workflow artifact `public-route-audit`. Scores are lab measurements, not field Core Web Vitals.

## Manual QA checklist

- [ ] Open `/`, `/careers`, `/pricing`, `/solutions`, `/support` and `/help`; confirm titles, layout and destination links.
- [ ] Open each `/auth/*` route and each `?role=` option; confirm invitation guidance, validation, show/hide password and recovery links.
- [ ] Use Tab/Enter on the header, role chooser, mobile menu and primary actions; confirm visible focus and no hidden menu focus.
- [ ] Change billing country to Nigeria, United States and an unpriced country; reload and check persistence, currency and quote text.
- [ ] Check basic/professional/business checkout, enterprise sales and invalid plans; confirm signup/login preserves the selected plan.
- [ ] Visit a solution workspace while signed out, and while signed into a different role; confirm login `next` and HTTP 403 respectively.
- [ ] Submit a ticket in a test account and confirm its success message and saved entry.
- [ ] Confirm the public careers empty state and an open job’s applicant-only full details.
- [ ] Trigger 404 and a server failure in a non-production environment; confirm safe home/retry links.

## File-by-file changes

| File | Change |
| --- | --- |
| `.github/workflows/ci.yml` | Run lint, responsive route/auth journeys, axe and Lighthouse; retain QA evidence artifacts. |
| `.github/workflows/signed-in-verification.yml` | Run lint, responsive route/auth journeys, axe and Lighthouse; retain QA evidence artifacts. |
| `database/036_password_recovery.sql` | Store hashed, expiring, single-use recovery tokens with account throttling index. |
| `eslint.config.mjs` | Enable actual Next.js and TypeScript linting; retain documented legacy findings as warnings. |
| `next.config.ts` | 308 careers redirects and CSP, framing, referrer, content-type and device permission headers. |
| `scripts/migrate.mjs` | Include additive password-recovery migration. |
| `scripts/verify-public-routes.mjs` | Verify listed routes, breakpoints, links, keyboard/accessibility, auth, billing, tickets, recovery and Lighthouse. |
| `scripts/verify-signed-in.mjs` | Update canonical careers paths, coming-soon billing expectations and real 403 checks; generate test passwords. |
| `src/app/api/ats/route.ts` | Return public job summaries; require an applicant session for full details and assessments. |
| `src/app/api/auth/password/route.ts` | Secure role-specific recovery emails and token consumption, throttling and session invalidation. |
| `src/app/api/billing/route.ts` | Reject checkout initialisation when live billing is unavailable. |
| `src/app/applicant/layout.tsx` | Preserve protected destination when a session expires; retain server-side authorisation. |
| `src/app/auth/activate/layout.tsx` | Unique route metadata, canonical/social tags and appropriate indexing controls. |
| `src/app/auth/forgot-password/page.tsx` | Metadata and accessible recovery form entry point. |
| `src/app/auth/login/layout.tsx` | Unique route metadata, canonical/social tags and appropriate indexing controls. |
| `src/app/auth/login/page.tsx` | Working role chooser, accessible field labels, safe return paths, error/loading/toggle controls and recovery link. |
| `src/app/auth/reset-password/page.tsx` | Metadata and accessible recovery form entry point. |
| `src/app/auth/signup/applicant/layout.tsx` | Unique route metadata, canonical/social tags and appropriate indexing controls. |
| `src/app/auth/signup/applicant/page.tsx` | Password toggle and canonical role-safe post-registration destination. |
| `src/app/auth/signup/employee/layout.tsx` | Unique route metadata, canonical/social tags and appropriate indexing controls. |
| `src/app/auth/signup/employee/page.tsx` | Dedicated invitation guidance and employee sign-in link instead of misleading self-registration. |
| `src/app/auth/signup/employer/layout.tsx` | Unique route metadata, canonical/social tags and appropriate indexing controls. |
| `src/app/auth/signup/employer/page.tsx` | Preserve chosen checkout, use shared countries/password toggle and remove unsupported feature promises. |
| `src/app/auth/signup/layout.tsx` | Unique route metadata, canonical/social tags and appropriate indexing controls. |
| `src/app/auth/signup/page.tsx` | Correct three-audience signup choices and invitation-only employee guidance. |
| `src/app/billing/page.tsx` | Disable unavailable checkout, retain country/plan selection and offer a sales contact. |
| `src/app/careers/[id]/page.tsx` | Gate single-job details by applicant session, validate vacancy IDs and add truthful JobPosting data. |
| `src/app/careers/page.tsx` | Render indexable job summaries, real availability/empty states and ItemList data on the server. |
| `src/app/dashboard/employer/layout.tsx` | Preserve protected destination when a session expires; retain server-side authorisation. |
| `src/app/employee/layout.tsx` | Preserve protected destination when a session expires; retain server-side authorisation. |
| `src/app/error.tsx` | Safe custom error/access pages with home, retry or correct-role actions. |
| `src/app/forbidden/page.tsx` | Safe custom error/access pages with home, retry or correct-role actions. |
| `src/app/global-error.tsx` | Safe custom error/access pages with home, retry or correct-role actions. |
| `src/app/globals.css` | Visible keyboard focus, skip link and safe content wrapping. |
| `src/app/help/page.tsx` | Public sign-in guidance or authenticated ticket form, without unauthorised fetch errors. |
| `src/app/jobs/[id]/page.tsx` | Keep legacy jobs addresses as permanent canonical careers redirects. |
| `src/app/jobs/layout.tsx` | Keep legacy jobs addresses as permanent canonical careers redirects. |
| `src/app/jobs/page.tsx` | Keep legacy jobs addresses as permanent canonical careers redirects. |
| `src/app/layout.tsx` | Metadata defaults, favicon, UK language and keyboard skip-to-content target. |
| `src/app/not-found.tsx` | Safe custom error/access pages with home, retry or correct-role actions. |
| `src/app/page.tsx` | Unique home metadata and remove duplicate role-sign-in CTA set. |
| `src/app/pricing/checkout/page.tsx` | Validate plans and preserve chosen country/plan through authentication; handle coming-soon and enterprise sales. |
| `src/app/pricing/layout.tsx` | Unique pricing metadata and canonical/social tags. |
| `src/app/pricing/page.tsx` | Pass safe server-side live-billing availability to the pricing interface. |
| `src/app/robots.ts` | Publish crawl rules and canonical public-page sitemap. |
| `src/app/sitemap.ts` | Publish crawl rules and canonical public-page sitemap. |
| `src/app/solutions/page.tsx` | Unique metadata; preserve explicit current capability and provider limitations. |
| `src/app/support/page.tsx` | Unique metadata, business-contact config and working email/international telephone actions. |
| `src/components/aerotech-portal.tsx` | Consistent careers/company/sign-in links, complete mobile menu and close-on-navigation behaviour. |
| `src/components/brand-logo.tsx` | Use next/image with dimensions while retaining the existing brand asset. |
| `src/components/country-select.tsx` | One disabled placeholder, deduplicated countries and code values for stable billing selection. |
| `src/components/password-recovery.tsx` | Accessible request/reset forms with loading, errors, password toggle and confirmation. |
| `src/components/pricing-page.tsx` | Persist country/currency, remove duplicate country options, align plan actions and expose honest payment status. |
| `src/components/recruitment-workspace.tsx` | Use canonical careers links throughout recruitment and applicant navigation. |
| `src/components/site-navigation.tsx` | Public header on careers list; avoid duplicate headers in the applicant job-detail workspace. |
| `src/components/workspace-shell.tsx` | Use canonical careers links throughout recruitment and applicant navigation. |
| `src/lib/auth-navigation.ts` | Validate same-origin, role-scoped return destinations and build safe login links. |
| `src/lib/countries.ts` | One disabled placeholder, deduplicated countries and code values for stable billing selection. |
| `src/lib/portal-routing.ts` | Protect careers details while keeping the canonical careers list public. |
| `src/lib/public-jobs.ts` | Server-only public job query with explicit availability handling. |
| `src/lib/seo.ts` | Reusable unique titles, descriptions, canonical/social tags and recovery-safe referrer policy. |
| `src/lib/support-contact.ts` | Centralise public support email/phone with environment overrides and +234 normalisation. |
| `src/proxy.ts` | Early role-cookie routing checks, clean 403 response for cross-portal access and trusted request-path headers. |
| `tests/launch-smoke.test.mjs` | Update canonical-route and applicant-detail protection expectations. |
| `tests/portal-automation.test.mjs` | Update canonical-route and applicant-detail protection expectations. |
