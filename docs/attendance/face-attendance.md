# Embedding-only employee face attendance

## What was found

- Next.js App Router / React 19 / TypeScript / Tailwind; native `pg` SQL access, **no ORM**.
- The project uses ordered SQL migrations with a `schema_migrations` checksum ledger. The feature uses that same ledger and lock, via a separate opt-in command so old PGlite test fixtures and existing deployments do not require pgvector just to start.
- Separate employer, employee and applicant sessions use HttpOnly cookies; employee identity and employer scope come from the server session. Employer administrators manage their tenant; employee managers may review assigned direct reports, never themselves.
- `hr_attendance_events` is the accepted event ledger, with `(employee_id,work_date,event_type)` uniqueness and Africa/Lagos workdays. Existing GPS evidence is stored in `attendance_verifications`. Current code supports overnight checkout against an actual open shift.
- Legacy Rekognition enrollment stored a reference photo in `employee_face_references`. New photo uploads are retired with an authenticated 410 response; existing URLs remain. No old reference photo is silently converted or bulk-deleted. Self deletion or manager reset deletes that employee's legacy reference as well as new templates. Supervised approval of the replacement descriptor enrollment also removes that employee's old reference photo and records the replacement in the audit trail. Confirm and execute a separate retention/purge decision for any remaining legacy photos and backups.

## Routes

| Role | Page | Purpose |
|---|---|---|
| Employee | `/employee/face-enroll` | Explicit consent, 3–5 samples, delete own data |
| Employee | `/employee/face-attendance?action=clock_in` | Camera check-in or manual request |
| Employee | `/employee/face-attendance?action=clock_out` | Camera check-out or manual request |
| Assigned employee manager | `/employee/manager/attendance` | Direct-report enrollment and attendance review |
| Employer administrator | `/dashboard/employer/attendance/face-review` | Organisation queue, enrollment status and reset |
| Existing alias | `/dashboard/employer/hr/attendance/faces` | Redirects to the new employer review queue |

Existing `/employee/attendance` retains location attendance, history and links to the optional flow. Existing GPS, authentication, subscriptions and tenant rules remain in effect. A legacy account that previously required configured Rekognition matching is not silently downgraded to GPS-only: it must complete supervised replacement enrollment, or HR must handle manual attendance during transition. Old photo attendance clients receive a clear re-enrollment error. New face endpoints explicitly reject image/video/photo payloads and return no embeddings. Their responses use `private, no-store`.

## Data and review semantics

`047_face_embeddings.sql` adds `vector`, `face_enrollments`, `face_templates`, single-use `face_challenges`, durable `face_attempt_limits`, `face_attendance_requests` and `face_attendance_audit`, plus nullable face/manual metadata on the accepted event table. A database trigger and serialized employee row locks enforce a maximum of five templates. An enrollment has 3–5 inactive templates until a supervisor confirms identity. Only that employee's active templates are compared with pgvector Euclidean `<->`; there is no workforce-wide identification search or approximate vector index.

**Every browser-only face request requires manager approval.** A browser can fabricate both its descriptor and motion evidence. Random prompts, session-bound single-use challenges and server-side matching reduce casual/replay abuse; they do not create trusted liveness attestation. No environment setting turns browser evidence into unattended verified attendance.

The `liveness_passed` field records that browser motion met consistency rules; `liveness_source='browser_unattested'` explicitly qualifies it. It is not a claim of certified presentation-attack detection. Accepted event `status='verified'` means a manager approved the request, not that browser liveness became cryptographically trusted.

Pending attendance lives in a separate queue and does not feed payroll. Approval inserts into the canonical event ledger using the **original server-recorded request timestamp**, not the manager's review time or a device timestamp. Approvals, rejections, resets, enrollment invitations, consent and deletions have an actor/reason/time audit record. Duplicate/order checks are serialized with the same employee lock used by existing location attendance. Canonical uniqueness remains the final guard. Missed checkout older than 24h is flagged in the manager queue and audit; it is not silently closed. Use the authorised HR correction process to correct such history.

## Configuration

| Variable | Default | Meaning |
|---|---|---|
| `FACE_ATTENDANCE_ENABLED` | `false` | Keep off until migration, HR/privacy review and testing are complete |
| `FACE_MATCH_THRESHOLD` | `0.45` | Strict Euclidean candidate-match boundary; parser restricts 0.1–0.5 |
| `FACE_REVIEW_THRESHOLD` | `0.50` | Maximum uncertain-match distance; must not be below strict boundary; parser caps at 0.6 |
| `FACE_GEOFENCE_ENABLED` | `false` | Optional location review checks for the new flow only |
| `FACE_OFFICE_LATITUDE` | blank | Fallback office latitude if no active assigned attendance site |
| `FACE_OFFICE_LONGITUDE` | blank | Fallback office longitude |
| `FACE_OFFICE_RADIUS_M` | `150` | Fallback radius, 30–5000m |

Existing assigned company attendance sites take precedence over the fallback coordinates. If geofence is enabled, missing location or an out-of-range location is visibly flagged for manager review. Location remains an explicit opt-in; refusing location does not force biometric collection. Browser location is not trusted hardware attestation. Existing location-only attendance keeps its stricter GPS rules.

Fixed safety settings: three issued camera challenges per five-minute window, three failed matches/motion attempts lock for five minutes, 45-second one-time session-bound challenges, at most three manual requests per five minutes, 40 KB request-body cap, five templates maximum and supervisor approval before activation. Manual fallback is independent of a camera lock. No client clock controls attendance time.

## Exact Neon migration steps

1. Select the intended Neon project, **branch and database**. Start on a disposable staging branch, never an unrelated preview or production branch. Check the selected branch carefully.
2. In the Neon SQL Editor for that database run:

   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   SELECT extversion FROM pg_extension WHERE extname = 'vector';
   ```

   The extension name is `vector`, not `pgvector`. If permission is denied, use the database owner's approved role; do not weaken database permissions.
3. Check out this feature release and run `npm ci`. Set `DATABASE_URL` securely in your shell/secret store to the **same selected branch/database**. Do not paste the credential into chat, commit it, or publish terminal output containing it.
4. Run core migrations first:

   ```sh
   npm run db:migrate
   ```

   If the runner reports an existing schema without a ledger, stop and inspect the actual applied schema. Only after confirming its latest migration should an authorised operator use the existing `--baseline-through=FILE` adoption mechanism. Do not blindly baseline or replay old migrations.
5. Apply the opt-in feature migration:

   ```sh
   npm run db:migrate:face
   ```

   It requires core migration 046 in the ledger and verifies its own checksum on later runs. It creates tables, constraints and metadata, and does not migrate or erase existing photo references.
6. Verify in the same Neon SQL Editor:

   ```sql
   SELECT name, applied_at FROM schema_migrations WHERE name='047_face_embeddings.sql';
   SELECT data_type, udt_name FROM information_schema.columns
     WHERE table_name='face_templates' AND column_name='embedding';
   SELECT count(*) FROM face_templates;
   ```

   On a new installation the last count should be zero. Never export or display real embeddings for verification.
7. Configure the feature variables for **staging only**, enable the feature, build and deploy, and run the tests below. Set production variables and enable production only after approval and physical-device validation. Changing runtime variables on Vercel requires deployment to apply.
8. Rollback: set `FACE_ATTENDANCE_ENABLED=false` and redeploy. Keep the additive schema and the old production deployment available. Do not drop tables or silently restore stale templates to roll back code.

## Dependencies / model files

One added application-build dependency: `@vladmandic/face-api@1.7.15` (MIT), pinned in the npm lockfile. It is a dev/build dependency; server handlers do not import TensorFlow or the Node inference backend.

`prebuild` / `predev` copy its browser ESM bundle, Tiny Face Detector, 68-landmark, 128-descriptor recognition and expression models and license into generated `public/models`. Assets are served by the app; no external CDN, image upload, face SaaS or AWS calls are used by the new flow. `asset-integrity.json` records version and hashes. Do not edit generated files. Only this generated third-party directory is excluded from application ESLint; source remains linted. Browser import is lazy, loads once per page session and uses HTTP asset caching.

## Runtime compatibility

New route handlers explicitly declare `runtime='nodejs'` because the existing auth/session and PostgreSQL layer depends on Node `pg`, `node:crypto` and Next server APIs. New IDs, randomness and challenge hashes use Web Crypto, but that does **not** make the imported existing database/auth stack Edge-compatible.

- Vercel: ordinary Next.js Node functions; no native face-inference binary in server routes.
- Cloudflare: requires a working Next.js Worker adapter, `nodejs_compat`, compatible database connectivity, and deployed runtime secrets. This checkout has a workflow referring to `cf:build` / Wrangler configuration that is not present in package scripts/config files. Cloudflare build and end-to-end execution are **not verified** by this change. Do not deploy these routes as Edge functions or claim production Cloudflare support without resolving that existing deployment gap.

## Privacy and operating requirements

Descriptors are sensitive biometric personal data even though no photos are stored. Use explicit, versioned, optional consent with a real manual alternative. Agree an appropriate privacy notice, retention period, least-privilege database access and incident process before production. Managers see enrollment status, distances and challenge status, not descriptors. Privileged database operators can access stored templates; restrict that access. Do not log request bodies, record camera sessions in analytics, or include descriptors in error telemetry.

Self deletion remains authenticated and is not gated by an active paid subscription or the face feature switch. Manager reset also permits deletion with a valid scoped session while the feature is off. Ordinary attendance history and non-biometric audit metadata are retained under the organisation's retention policy. Backups require a documented retention/erasure process; deleting active rows does not instantly erase every historical backup.

Thresholds, motion heuristics and lighting checks require representative device/person testing and false-reject review. They are not certified liveness/PAD. Known residual risks: modified JavaScript, crafted descriptors, replayed/deepfake video, virtual cameras, stolen authenticated sessions and spoofed geolocation. Supervisor enrollment approval, mandatory attendance review, single-use challenges, session binding, attempt limits and optional geofence reduce risk. Hardware-backed device binding / signed trusted liveness attestation is not implemented. Do not use browser face results for automatic discipline, payroll penalties or other adverse decisions.

## Automated verification commands

```sh
npm run lint
npm test
npm run test:integration
npm run build
npx tsc --noEmit
# Real pgvector integration: disposable local PostgreSQL only
FACE_TEST_DATABASE_URL=postgres://postgres:TEST_PASSWORD@127.0.0.1:5432/aerotech_face_test \
 node --experimental-test-module-mocks --import ./tests/helpers/ts-loader.mjs tests/face-postgres.pgvector.mjs
# Requires installed Playwright Chromium; synthetic UI fixtures and blank video only
node scripts/verify-face-mobile.mjs
```

The dedicated GitHub workflow supplies isolated pgvector PostgreSQL and Playwright. Real SQL tests cover consent enrollment, inactive/active templates, uncertain match, distance/replay rules, server time, duplicate/order checks, tenant isolation, rate limiting and deletion. Mobile tests cover 360/390px portrait, accessibility, explicit consent, permission denial, actual local model loading, blank-frame rejection and camera-track cleanup. UI fixtures are not physical-device liveness proof.
