# Phase 2 collaboration plan
Baseline: main 8a3e47924bfea7706fabbf51f2d4e82ba2551e49, 27 October 2026.
Audit: shared portal shell exists; pg migrations (not Prisma); meeting picker fetches whole workforce, join endpoint lacks meeting window; submissions have no versioned employer library. Existing legacy vacancy routes remain in the source; do not re-enable them.

## Data model before implementation
All resource tables carry employer_id; composite foreign keys bind child records to their tenant. Actor identity is derived from the authenticated cookie, never body employer_id. Employee access requires project membership or an explicit document grant. Project Viewer cannot write; Owner/Manager maintain members and project/task structure. Contributor updates permitted tasks. Employer retains company management rights. UUID identifiers are validated and paginated queries have bounded limits. Tasks in different tenants cannot form dependencies; cycle checks are transactional.

Projects, members, tasks, assignees, checklist items, dependencies, comments, activities, saved views, milestones and feature-gated time entries.
Existing meet_rooms/meet_participants extended with scheduling metadata and link revocation. Saved invite groups, group references and exclusions are resolved server-side; employee search returns 20 records. RSVP, notes, attendance and action-item/task links remain company-scoped.
Document folders, documents, immutable versions, sharing grants, templates, acknowledgements and event audit; content is encrypted and quarantined pending a scan. Downloads require session plus expiring signed grant. Restore creates a new version rather than rewriting history.
Job queue, notification preferences, outbox and sensitive-action audit. Workers use leases, dedupe keys, retry/backoff and dead-letter status. Request-time join checks are authoritative even if the scheduler is late. Emails contain a role-specific meeting page, never a join credential.

## Endpoint plan
/api/projects (GET/POST), /api/projects/[id] (GET/PATCH), nested tasks/members/comments/dependencies/time/report APIs; /api/my-tasks.
/api/meet (GET/POST/PATCH), /api/meet/people, /api/meet/groups, /api/meet/[id]/join, /api/meet/[id]/details and action items.
/api/document-library (metadata/upload/folders/templates), /api/document-library/[id] (versions/grants/restore/acknowledgement/download).
/api/collaboration/notifications and /api/collaboration/search; /api/cron/collaboration; /api/admin/audit.

## Milestones and verification
1 Projects/tasks and authorised dashboards; 2 scalable meetings + expiry; 3 private versioned documents and acknowledgements; 4 automation, search, audit. Check types, lint, existing tests, new policy/expiry/selection tests, isolated SQL/API integration and browser flows. Record actual failures and unmet checks. Do not claim migration, email/provider delivery, axe or Lighthouse success without evidence.

Scope: authenticated electronic acknowledgement with version/hash/time audit. Qualified or provider-backed legal e-sign is a later integration. No HR email is sent to real employees while testing. No production data reset or migration without a validated isolated run.
