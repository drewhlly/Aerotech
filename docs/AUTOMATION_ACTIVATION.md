# Activation handover
Starting main: 442395772d15e0ff824bbecdc9a7453305f6106f. Charter reconstructed because neither AGENTS.md nor CLAUDE.md existed there. Existing CI and safe-auto-repair are not the requested full system.

## Exact administrator steps
In your terminal, run `gh auth login`, then:
```
gh variable set REPORTS_ENABLED --repo drewhlly/Aerotech --body "true"
gh secret set REPORT_RECIPIENT --repo drewhlly/Aerotech --body "drewhlly@gmail.com"
gh secret list --repo drewhlly/Aerotech
# Only if missing; each command prompts securely:
gh secret set ANTHROPIC_API_KEY --repo drewhlly/Aerotech
gh secret set RESEND_API_KEY --repo drewhlly/Aerotech
gh variable set REPORT_FROM_EMAIL --repo drewhlly/Aerotech
```
For REPORT_FROM_EMAIL enter an existing verified sender address from Resend. Do not invent one. In Settings > Actions > General, allow workflow PR creation; keep default permissions read-only and job-specific write permissions. In Settings > General allow auto-merge. Settings > Rules > Rulesets: protect main, require PRs and one reviewer, no bypass/direct/force pushes, require CI, face, signed-in and actual deployment checks by their observed context names. A global write default is unnecessary and contradicts least privilege.

Settings > Code security: enable Dependabot alerts/security updates, secret scanning/push protection and code scanning where available. Do not assume dependabot.yml alone enables alerts or code scanning. Verify Resend domain settings and exact SPF/DKIM records plus DMARC in DNS.

After owner reviews/merges the Tier 2 activation PR:
```
gh workflow run ci.yml --repo drewhlly/Aerotech --ref main
gh workflow run nightly-maintenance.yml --repo drewhlly/Aerotech --ref main
gh workflow run daily-report.yml --repo drewhlly/Aerotech --ref main
gh workflow run weekly-benchmark.yml --repo drewhlly/Aerotech --ref main
gh workflow run self-heal.yml --repo drewhlly/Aerotech --ref main
gh run list --repo drewhlly/Aerotech --limit 20
```
This PR does not claim a production backup run, a deliberate failure experiment, a successful mail delivery, full autonomous repair, full benchmark research or instant alerts. Self-heal proposes mechanical UI fixes only, from trusted main, one attempt per invocation, with human review; a persistent three-attempt orchestration and needs-human escalation remain to implement. Do not label its TypeScript fixes tier1-auto by assumption. The auto-merge guard permits only narrow CSS and maintenance notes, requires branch protection, and never checks out PR code. Enabling auto-merge is not proof of merge or checks.

## Follow-up gates
- Build persistent failure identity/three-attempt ledger and a disposable harmless failing-test experiment, then remove only the named experiment branch.
- Main payroll job failure metadata now triggers the report job as a Critical alert; validate this end-to-end. Add event-driven immediate alerts for production/deployment failures, verified Critical findings and secret detections. Honour REPORTS_ENABLED false except Critical. Never send untrusted logs or findings bodies.
- Integrate exact Cloudflare/Vercel deployment observations, 24-hour merge evidence, security alert status and signed-in health into daily report. Current report explicitly marks missing evidence.
- Provider email accepted is not delivered; inspect engineering-delivery.json and Resend event status, then the owner's Inbox/Spam. No email is sent outside the report job.
- Add code scanning after verifying plan/tool support. Pin any added third-party action to its audited SHA.
- Re-test Tier 2 PRs on each new main head with isolated data only.

Rollback: disable new schedules via Actions UI, remove tier1-auto labels and disable repository auto-merge if needed; revert this PR through a normal checked PR. No schema or runtime application behaviour is changed. Never run backups or migrations as part of activation tests.

Backup PR note: replace only the disposable restore service image with pgvector/pgvector:0.8.7-pg18-trixie, preserving PostgreSQL major 18. Official image/tag reference: https://github.com/pgvector/pgvector#docker . Do not dispatch backups.yml: it reads production data and uploads private archives. This change is proposed, not a successful restore.
