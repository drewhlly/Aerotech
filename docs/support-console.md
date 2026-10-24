# Aerotech support console

Company admins use `/support/tickets` to create a ticket, explicitly select diagnostic scopes, and approve read-only access for 15, 30 or 60 minutes. Creating a ticket shares its text with support but grants no diagnostic access. Customers can revoke immediately. Closing a ticket revokes every grant and records a resolution summary visible to the company. History remains accessible for closed tickets. Support tickets do not depend on an active paid subscription.

Staff sign in at `/support-console/login` with separate provisioned credentials and a unique authenticator secret (TOTP). There is no public staff signup and no automatic privilege for employer/applicant/employee accounts. Sessions expire in 15 minutes, disabled agents are rejected on every request, login is rate-limited, and successful authenticator codes cannot be replayed. Staff can view submitted tickets, read approved diagnostics, and close a ticket with a summary. They cannot impersonate a customer, grant themselves access, change customer data, approve payroll, make payouts, change bank details, or delete records.

Diagnostics use fixed SQL projections scoped to the ticket's employer ID. Only counts and configuration booleans are returned. No salaries, bank details, credentials, employee identity fields or document contents are exposed. Reads, denials, consent, revocation and closure are audited. Audit and staff-auth events reject UPDATE and DELETE through database triggers. A database owner can still administratively alter triggers: this is application-level append-only auditing, not external tamper-proof storage.

## Deployment

Apply `021_support_console.sql` with `npm run db:migrate` before serving the new routes. This feature has no dependency on the separate Paystack subscription PR/migration 020. When merging both, retain both migrations in the runner.

Before enrolling staff, set a cryptographically random 32-byte hex `SUPPORT_MFA_ENCRYPTION_KEY` as a production server Secret. Retain it in the operator's secure secret manager: rotating without re-encrypting existing authenticator secrets prevents staff sign-in. Never put it in source, chat or public-prefixed variables.

Provision only identities explicitly approved by Aerotech's owner. On a trusted operator machine with Node 24, set DATABASE_URL and SUPPORT_MFA_ENCRYPTION_KEY through a secure local environment. Create a temporary JSON file readable by its owner only (`chmod 600`) containing email, displayName, a unique staff password of at least 16 characters, and a unique base32 totpSecret already entered into that staff member's authenticator. Then run:

```sh
node scripts/provision-support-agent.mjs /private/support-agent.json
```

The script refuses duplicate emails and never prints credentials. Delete the temporary credential file after secure delivery/enrollment. There is deliberately no default staff account, password or bypass. To disable a compromised agent, an authorised database operator sets support_agents.disabled=true and removes its support_sessions. Disabling is checked for existing sessions as well as login. Staff credential/MFA recovery requires the deployment operator; there is no public recovery shortcut.

## Verification

`npm test` includes RFC 6238 vectors, code-replay rejection, authenticator window bounds, encryption authentication and scope/duration checks. `npm run build` verifies compilation/types/routes.

Run the optional full HTTP integration test against its own ephemeral PGlite database (no real accounts or emails):

```sh
npm install --prefix /tmp/aerotech-support-test-deps @electric-sql/pglite pglite-server --no-audit --no-fund
SUPPORT_TEST_DEPENDENCIES=/tmp/aerotech-support-test-deps node scripts/test-support-flow.mjs
```

The runner starts a local Next.js dev server on port 3005 and isolated database server on 55439, applies all migrations and checks company isolation, staff MFA and replay protection, CSRF, denial before approval, scoped counts, no PII, self-grant rejection, employer write-API rejection, expiry, revocation, closure, company-visible history, audit immutability and disabled-agent sessions. Run it separately from a build/dev process in the same checkout. Browser visual QA and external notifications are not covered by this HTTP test.

Ticket creation and summaries appear in the application. Email delivery is not claimed: the existing Resend service still needs separately configured credentials and a verified sender.
