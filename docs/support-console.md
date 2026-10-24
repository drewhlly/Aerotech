# Aerotech support console

Company admins use `/support/tickets` to create a ticket, explicitly select diagnostic scopes, and approve read-only access for 15, 30 or 60 minutes. Creating a ticket shares its text with support but grants no diagnostic access. Customers can revoke immediately. Closing a ticket revokes every grant and records a resolution summary visible to the company. History remains accessible for closed tickets. Support tickets do not depend on an active paid subscription.

Staff sign in at `/support-console/login` with separate provisioned credentials and a unique authenticator secret (TOTP). There is no public staff signup and no automatic privilege for employer/applicant/employee accounts. Sessions expire in 15 minutes, disabled agents are rejected on every request, login is rate-limited, and successful authenticator codes cannot be replayed. Staff can view submitted tickets, read approved diagnostics, and close a ticket with a summary. They cannot impersonate a customer, grant themselves access, change customer data, approve payroll, make payouts, change bank details, or delete records.

Diagnostics use fixed SQL projections scoped to the ticket's employer ID. Only counts and configuration booleans are returned. No salaries, bank details, credentials, employee identity fields or document contents are exposed. Reads, denials, consent, revocation and closure are audited. Audit and staff-auth events reject UPDATE and DELETE through database triggers. A database owner can still administratively alter triggers: this is application-level append-only auditing, not external tamper-proof storage.

## Deployment

For an existing production database, apply only `021_support_console.sql` with `node scripts/migrate-support.mjs` before serving the new routes. The production deployment build command is `node scripts/migrate-support.mjs && npm run build`. This runs transactionally with an advisory lock and avoids replaying older non-idempotent payroll migrations. Fresh isolated databases can use `npm run db:migrate` to create the complete schema. This feature has no dependency on the separate Paystack subscription PR/migration 020. When merging both, retain both migrations in the runner.

## Owner-approved self-enrollment

An explicitly approved owner can enroll at `/support-console/enroll` without sharing passwords or authenticator secrets in chat. Set `SUPPORT_INITIAL_AGENT_EMAIL` to the owner-approved existing Aerotech login email, and run `node scripts/enable-support-enrollment.mjs` once from an authorised production deployment. The script applies migration 022 and snapshots the existing employer (or applicant) account ID. It does not grant company diagnostic access. If no matching existing account is found, no approval is created. Do not enable an arbitrary public email or grant staff status on account signup.

The user proves their existing account password, chooses a different staff password of at least 16 characters, adds the displayed key to their authenticator, then confirms a six-digit code and the new staff password. Pending enrollment expires in 10 minutes and allows five confirmation attempts. Both begin and confirm are same-origin only, and beginning enrollment is rate-limited. The approval is consumed atomically on confirmation; replay and later registration cannot claim a consumed approval. No staff role exists until authenticator confirmation succeeds. Enrollment starts a 15-minute staff session.

New authenticator secrets are AES-256-GCM encrypted using a domain-separated scrypt key derived from the staff password and its random salt; no shared server encryption key is required. Password recovery/rotation must re-enroll the authenticator with a deployment operator. Legacy operator-provisioned records that used SUPPORT_MFA_ENCRYPTION_KEY still require that existing server secret until re-enrolled.

For additional staff, a trusted deployment operator can provision an identity explicitly approved by Aerotech's owner. Create a temporary JSON file readable by its owner only (`chmod 600`) containing email, displayName, a unique staff password of at least 16 characters, and a unique base32 totpSecret already entered into that staff member's authenticator. With DATABASE_URL set securely, run:

```sh
node scripts/provision-support-agent.mjs /private/support-agent.json
```

The script refuses duplicate emails and never prints credentials. Delete the temporary credential file after secure delivery/enrollment. There is no default staff account or public recovery bypass. To disable a compromised agent, an authorised database operator sets support_agents.disabled=true and removes its support_sessions. Disabled status is checked for existing sessions too.

## Verification

`npm test` includes RFC 6238 vectors, code-replay rejection, authenticator window bounds, encryption authentication and scope/duration checks. `npm run build` verifies compilation/types/routes.

Run the optional full HTTP integration test against its own ephemeral PGlite database (no real accounts or emails):

```sh
npm install --prefix /tmp/aerotech-support-test-deps @electric-sql/pglite pglite-server --no-audit --no-fund
SUPPORT_TEST_DEPENDENCIES=/tmp/aerotech-support-test-deps node scripts/test-support-flow.mjs
```

The runner starts a local Next.js dev server on port 3005 and isolated database server on 55439, applies all migrations and checks company isolation, staff MFA and replay protection, CSRF, denial before approval, scoped counts, no PII, self-grant rejection, employer write-API rejection, expiry, revocation, closure, company-visible history, audit immutability and disabled-agent sessions. Run it separately from a build/dev process in the same checkout. Browser visual QA and external notifications are not covered by this HTTP test.

Ticket creation and summaries appear in the application. Email delivery is not claimed: the existing Resend service still needs separately configured credentials and a verified sender.
