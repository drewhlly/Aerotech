# Encrypted production backups

GitHub Actions runs daily at 01:00 UTC (02:00 Lagos), on changes to this backup workflow, or manually using Run workflow on main. Every run uses PostgreSQL 18 to export through a dedicated SELECT-only database role, restores all schema/data into a fresh disposable PostgreSQL 18 service, compares every COPY table row count, encrypts with AES-256-GCM, and verifies SHA-256 after downloading each private R2 object.

Storage: Cloudflare account 3144bf081a43f5ca5bc88b60e956a9ce, private bucket aerotech-private-backups, daily/ timestamp prefixes. Source archives exclude dependencies, build output and environment files. Runtime secret values and external video recordings are not included. No automatic deletion policy is applied. Database archives contain sensitive HR data and must remain private.

## Authentication and recovery

The Worker at backup-control.aerotechhr.app accepts only GitHub-signed OIDC tokens for the exact main-branch backup workflow, repository ID and owner ID. It rejects other workflows, forks, pull requests, expired tokens and token replay. Credentials are masked in Actions and passed to native tools through environment variables. The Worker stores bucket-only R2 credentials, the SELECT-only database URL and the encryption key as secret bindings. No credentials are committed.

The separately stored recovery key is the encrypted Vercel Production variable AEROTECH_BACKUP_KEY_20261030. Preserve it while any corresponding backup exists. Each backup includes RESTORE.md, restore.py and manifest.json. Follow those instructions to decrypt and restore into an empty isolated database, never directly over production. Recovery requires access to both private R2 and that Vercel key. Rotate credentials through the Worker secret bindings; preserve old encryption keys for historical backups.

## Verification and operations

Actions job summaries contain the backup prefix and verified row counts. R2 monitor/last-success.json records the latest verified run; monitor/last-failure.json records failures and may predate a later success. Review timestamps and GitHub run status. GitHub workflow failure notifications follow repository/user settings. The daily schedule uses GitHub-hosted runners and can start late during GitHub incidents; it is not a live failover server.

The Worker source uses jose. Bundle it with esbuild for Cloudflare Workers (ES module, browser platform) and deploy with the five existing secret/bucket bindings. Keep the expected workflow filename and OIDC audience synchronized when changing infrastructure. Public access to /credentials without a valid signed token must return 401.
