# Shared portal login UI

All three portals retain the shared route `src/app/auth/login/page.tsx`:

| Portal | Route | Default redirect | Registration |
| --- | --- | --- | --- |
| Applicant | `/auth/login?role=applicant` | `/applicant` | `/auth/signup/applicant` |
| Employee | `/auth/login?role=employee` | `/employee` | Invitation only; no public sign-up |
| Employer | `/auth/login?role=employer` | `/dashboard/employer` | `/auth/signup/employer` |

`AuthLayout` and `portal-config` now supply the shared desktop split screen, mobile header and per-portal content. `LoginForm` retains the role-specific POST endpoints and `safeReturnTo` allowlist. The configured default redirects are imported from the existing portal routing policy. Switching portal remounts the form to clear credentials, error state and password visibility.

Remember me explicitly remembers only the email for the selected portal on this device. It does not store passwords or session tokens and does not extend or shorten the existing seven-day HttpOnly session. Clearing the checkbox removes the remembered email. Storage-denied browsers can still sign in.

## Local verification

- Production build and TypeScript: passed.
- Targeted component ESLint: passed.
- Existing portal-isolation test: passed.
- Real successful login API requests against isolated synthetic accounts: passed for Applicant, Employee and Employer. Verified the matching HttpOnly/SameSite session cookie.
- Real wrong-password rejection: passed for all three portals.
- Real cross-portal rejection: all six wrong-portal account combinations returned HTTP 401.
- Browser visual, keyboard, Axe AA and UI redirect checks at 360, 768, 1024 and 1440px: **unverified locally**. Chromium launch was blocked by the execution environment (`socket() failed: Operation not permitted`). This is not evidence of an application failure.

`node scripts/verify-portal-login-ui.mjs --api-only` reproduces the API checks. Without the flag, the same script also verifies the four widths, sign-in and safe default redirects, email remembering, inline validation, show/hide password, Enter submission, disabled/loading controls and generic credential/locked/rate-limited/service/network errors. Browser-only error cases use intercepted responses and do not establish backend behavior. The dedicated PR workflow runs this against disposable local PostgreSQL-compatible fixtures, never production accounts.

## Existing security observations (not changed)

The three handlers have durable account/role-scoped rate limiting and HttpOnly cookie sessions. No per-IP limiter was found in these three handlers; protection elsewhere was not audited. Account-only attempt counters can be exhausted by another caller who knows the email. This needs a separate security review, not a UI change. No authentication, account policy, password hashing, session handling or endpoint files were modified.
