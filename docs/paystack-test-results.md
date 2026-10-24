# Employer payment verification — 24 October 2026

Production was not changed and no real payment was charged.

## Real Paystack connection

A branch-scoped Vercel preview ran scripts/test-paystack-connectivity.mjs using the configured test key. Paystack returned HTTP 200, status true, and Authorization URL created. This initializes an unpaid test transaction; it is not a completed payment.

## Isolated application integration

Ran the actual Next.js HTTP routes against a temporary in-memory PostgreSQL instance through PGlite's wire protocol. All 20 database migrations succeeded. The gateway responses were simulated locally because Paystack blocks this execution environment with HTTP 403 / error 1010; no production database credentials or records were used.

Passed:
- Employer registration persists account and selected country.
- Unpaid dashboard redirects to pricing.
- Unpaid employee API returns 401.
- Checkout initialization ignores a forged client amount and currency, prices the Basic Nigeria plan at NGN 500,000 annually, and returns the gateway checkout URL.
- Failed verification returns 422 and creates no subscription.
- Successful verification creates the annual subscription.
- A signed webhook replay returns 200 without extending expiry again.
- A forged webhook returns 401.
- Paid employee API returns 200.
- Paid employer dashboard renders with HTTP 200.

The existing automated suite also passed 18 tests and the production build passed locally.

## Remaining verification

An interactive Paystack card/OTP checkout was not completed. The browser runner could not start because Chromium was absent and its download failed. Therefore this report does not claim an end-to-end completed transaction through the Paystack-hosted payment screen. Before production activation, complete that test with an isolated preview database and confirm the live merchant configuration and webhook delivery. Test key should be rotated because it was shared in chat.
