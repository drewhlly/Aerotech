# Automation environment
Names only; never put values here. Repository secret presence is NOT verified.

| Name | Kind | Purpose | Status |
|---|---|---|---|
| ANTHROPIC_API_KEY | Actions secret | Reserved for separately reviewed agent executor | Not verified; no AI executor in this PR |
| RESEND_API_KEY | Actions secret | Report sender only | Not verified |
| REPORT_RECIPIENT | Actions secret | Owner-only recipient, enforced by script | Not verified |
| REPORTS_ENABLED | Actions variable | Exact true enables routine reports | Not verified |
| REPORT_FROM_EMAIL | Actions variable | Real verified sender address on owned domain | Needs owner to select; never invented |

Hosting variables are separate from repository Actions secrets. Do not copy live database, payroll or authentication secrets into these jobs. All new jobs work without production DATABASE_URL. Branch protections and settings require administrator access. Default GITHUB_TOKEN should be read-only; grant contents/pull-requests write only to the reviewed repair and merge jobs. Actions-generated PRs may not trigger CI with GITHUB_TOKEN; do not bypass checks: use a reviewed GitHub App setup or owner PR events.

Public DNS checked 24 November: SPF present on aerotechhr.app and send.aerotechhr.app; DKIM present at resend._domainkey.aerotechhr.app; DMARC present at _dmarc.aerotechhr.app. These records do not prove a selected report sender is verified by Resend or mail reached the Inbox.
