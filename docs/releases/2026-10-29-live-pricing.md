# Live company subscriptions and revised annual pricing

Source: Aerotech Pricing Evaluation and Competitive Analysis, prepared 26 October 2026. The owner requested publication and live Paystack configuration on 29 October 2026.

## Audit and implementation

The old Professional and Business annual prices were NGN 1,000,000 and NGN 2,000,000. The signed-in billing screen still said payments were unavailable. Production had no backend payment credential. The shared plan catalogue, public pricing cards, server quotes and employer billing screen now use the approved Nigeria offer:

| Plan | Annual Nigeria list price | Included employee capacity |
| --- | --- | --- |
| Basic | NGN 500,000 | 25 |
| Premium | NGN 1,200,000 | 50 |
| Business | NGN 2,400,000 | 100 |
| Enterprise | From NGN 4,800,000, written quote | 200 in the entry quote |

Premium retains the internal `professional` and `employer_professional` identifiers. International prices, additional capacity and Enterprise scope require a quote. This release does not advertise the report's proposed AI credits, storage top-ups or meeting-minute packs as implemented usage billing.

Checkout computes the annual amount on the server, snapshots the pricing edition and capacity, validates the provider destination and returns to the same employer portal. A completed checkout is verified server-side before activation. Signed webhooks and browser returns share idempotent verification. Employer-only subscriptions remain required; Employee and Applicant accounts remain free.

Existing orders retain their saved amount. Migration 040 adds nullable capacity snapshots and a legacy pricing edition without changing existing subscription rows, amounts or expiry dates. Existing paid terms remain effective until the current term ends. New employee additions and CSV imports serialize capacity checks by company; hiring uses the same check. A rejected import rolls back completely. Early paid-tier downgrades are rejected before payment initialization.

## Files

| File | Purpose |
| --- | --- |
| `src/lib/subscriptions.ts` | Approved annual amounts, Premium display name, included capacities and pricing edition. |
| `src/lib/regional-pricing.ts` | Publish Nigeria list prices; request quotes for unpublished international pricing. |
| `src/lib/subscription-quote.ts` | Pure server-owned annual quote and minor-unit calculation. |
| `src/lib/subscription-capacity.ts` | Company-scoped, serialized capacity check for current contract terms. |
| `src/lib/employee-create.ts` | Apply capacity checking to manual creation and CSV imports. |
| `src/lib/billing.ts` | Preserve order snapshots, existing paid terms and replay-safe activation. |
| `src/app/api/ats/route.ts` | Apply capacity checking before adding a hired employee. |
| `src/app/api/billing/route.ts` | Authenticated billing data, server pricing, checkout and ownership checks. |
| `src/components/pricing-page.tsx` | Annual offer and included capacity on the public site. |
| `src/components/employer-billing.tsx` | In-portal checkout, payment-return verification and current contract status. |
| `src/app/dashboard/employer/billing/plans/page.tsx` | Replace the unavailable-payments placeholder with the billing workspace. |
| `database/040_subscription_pricing.sql` | Add order and subscription pricing/capacity snapshots; preserve legacy contracts. |
| `scripts/migrate.mjs` | Register migration 040 after the existing migrations. |
| `scripts/verify-paystack-live.mjs` | Read-only live authentication preflight; no charges or transfers. |
| `scripts/verify-signed-in.mjs` | Check the new signed-in billing workspace and Premium amount. |
| `scripts/verify-public-routes.mjs` | Verify public checkout returns to the company billing workspace. |
| `tests/subscription-pricing.test.mjs` | Check annual amounts, stable plan IDs, capacities and quote-only offers. |
| `tests/subscription-billing.integration.mjs` | Exercise API/data boundaries, tampering, replay safety and capacity rollback. |
| `package.json` | Commands for billing integration and live authentication verification. |
| `.github/workflows/ci.yml` | Run the isolated billing integration checks in CI. |
| This file | Audit, source decision, rollout and file summary. |

## Verification and rollout

Local lint, TypeScript and webpack production build passed. All 53 unit tests and nine isolated billing integration checks passed. Integration fixtures call no real provider and never connect to a production database.

Stage production with the read-only Paystack preflight before its app build. Apply migration 040 transactionally under the existing migration lock and record its checksum before promotion. Verify the published pricing, portal isolation and callback behavior. Never log credentials or provider balances. Production credentials are stored in Vercel's production environment, outside source control.

The subscription webhook endpoint is `/api/billing/webhook`. Configure it in the Paystack Live dashboard for automatic activation when a purchaser does not return to the browser callback. Existing payroll payout accounts remain company-specific and separate from Aerotech subscription collection.
