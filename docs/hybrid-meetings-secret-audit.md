# Full Git history secret audit — 19 November 2026

**History is not confirmed clean.** Gitleaks 8.30.1 completed against all 95 fetched heads/remotes/tags, including reachable history, in GitHub Actions run 44537642303. Exit 1 means findings, not a clean scan. A separate targeted full-history search completed with 46 retired-provider references. The metadata-only artifact records the exact refs and findings. No patches, key values or raw scanner matches are published.

Real generated Next.js encryption/preview-signing keys were identified in historical `.next` manifests. Before any history rewrite, rotate/rebuild affected deployment credentials, stop using compromised preview cookies/Server Action keys, and retire/protect deployments that still use those old keys. The current tree does not track those manifests. A fresh build regenerates default Next keys, but this audit has not proved that every old deployment is retired or that no operator configured a fixed key elsewhere. These are build credentials, not confirmed Daily/JaaS API keys.

Test/QA token patterns and migration-source identifiers also triggered rules. They are listed honestly below; no external provider was called to test whether a candidate is active. No literal old meetings-provider production key was confirmed. If any candidate corresponds to a real issued key, revoke/rotate it in its provider dashboard first. Removing the latest source line alone does not revoke it.

| Commit | File | Scanner type | Classification / action |
|---|---|---|---|
| `2c7b7882a739ed7a1ebe2bddf7bd226fc8cb2e76` | `tests/payout-api.integration.mjs` | stripe-access-token | Test/QA source; synthetic credential patterns present. No production-provider validity tested. |
| `26ee2ff0970fde2e0408ba197e4d2bc4bfd82df0` | `scripts/test-support-flow.mjs` | generic-api-key | Test/QA source; synthetic credential patterns present. No production-provider validity tested. |
| `26ee2ff0970fde2e0408ba197e4d2bc4bfd82df0` | `scripts/verify-signed-in.mjs` | stripe-access-token | Test/QA source; synthetic credential patterns present. No production-provider validity tested. |
| `26ee2ff0970fde2e0408ba197e4d2bc4bfd82df0` | `tests/support-security.test.mjs` | generic-api-key | Test/QA source; synthetic credential patterns present. No production-provider validity tested. |
| `26ee2ff0970fde2e0408ba197e4d2bc4bfd82df0` | `tests/payout-security.test.mjs` | stripe-access-token | Test/QA source; synthetic credential patterns present. No production-provider validity tested. |
| `5a0aafbe40284dcd1ff36fa4d58c5185a6b72530` | `scripts/migrate.mjs` | generic-api-key | Source identifier/string candidate; review required; not confirmed as an issued credential. |
| `b7682039fd7ed80d79718db434f69bb6125ce9d3` | `scripts/migrate.mjs` | generic-api-key | Source identifier/string candidate; review required; not confirmed as an issued credential. |
| `76fe68b3b259705a87f154e7b94227e2c8d0f0b5` | `scripts/migrate.mjs` | generic-api-key | Source identifier/string candidate; review required; not confirmed as an issued credential. |
| `8cc3f9addaf556e10ac05de86a3f5595b5ce4703` | `scripts/verify-signed-in.mjs` | stripe-access-token | Test/QA source; synthetic credential patterns present. No production-provider validity tested. |
| `8cc3f9addaf556e10ac05de86a3f5595b5ce4703` | `tests/payout-security.test.mjs` | stripe-access-token | Test/QA source; synthetic credential patterns present. No production-provider validity tested. |
| `2b6b3228615bdf93d9bc9a2fba1494f2f39d6ed4` | `scripts/verify-signed-in.mjs` | stripe-access-token | Test/QA source; synthetic credential patterns present. No production-provider validity tested. |
| `8579436d58df24accef289c3430786960df34d29` | `tests/payout-security.test.mjs` | stripe-access-token | Test/QA source; synthetic credential patterns present. No production-provider validity tested. |
| `06a2202e465de03f07991ce2f739c5e026529c72` | `scripts/test-support-flow.mjs` | generic-api-key | Test/QA source; synthetic credential patterns present. No production-provider validity tested. |
| `06a2202e465de03f07991ce2f739c5e026529c72` | `tests/support-security.test.mjs` | generic-api-key | Test/QA source; synthetic credential patterns present. No production-provider validity tested. |
| `05b04c394c9e39ba0d24235646a01d19d508473e` | `.next/dev/prerender-manifest.json` | generic-api-key | Generated Next.js build credential: rotate by fresh build and retire affected deployments; active reuse unverified. |
| `05b04c394c9e39ba0d24235646a01d19d508473e` | `.next/dev/prerender-manifest.json` | generic-api-key | Generated Next.js build credential: rotate by fresh build and retire affected deployments; active reuse unverified. |
| `05b04c394c9e39ba0d24235646a01d19d508473e` | `.next/dev/server/server-reference-manifest.json` | generic-api-key | Generated Next.js build credential: rotate by fresh build and retire affected deployments; active reuse unverified. |
| `05b04c394c9e39ba0d24235646a01d19d508473e` | `.next/prerender-manifest.json` | generic-api-key | Generated Next.js build credential: rotate by fresh build and retire affected deployments; active reuse unverified. |
| `05b04c394c9e39ba0d24235646a01d19d508473e` | `.next/prerender-manifest.json` | generic-api-key | Generated Next.js build credential: rotate by fresh build and retire affected deployments; active reuse unverified. |
| `05b04c394c9e39ba0d24235646a01d19d508473e` | `.next/server/server-reference-manifest.json` | generic-api-key | Generated Next.js build credential: rotate by fresh build and retire affected deployments; active reuse unverified. |
| `9d260dd464be230a43abc9d297edb0921f973b8e` | `.next/dev/prerender-manifest.json` | generic-api-key | Generated Next.js build credential: rotate by fresh build and retire affected deployments; active reuse unverified. |
| `9d260dd464be230a43abc9d297edb0921f973b8e` | `.next/dev/prerender-manifest.json` | generic-api-key | Generated Next.js build credential: rotate by fresh build and retire affected deployments; active reuse unverified. |
| `9d260dd464be230a43abc9d297edb0921f973b8e` | `.next/dev/server/server-reference-manifest.json` | generic-api-key | Generated Next.js build credential: rotate by fresh build and retire affected deployments; active reuse unverified. |
| `9d260dd464be230a43abc9d297edb0921f973b8e` | `.next/prerender-manifest.json` | generic-api-key | Generated Next.js build credential: rotate by fresh build and retire affected deployments; active reuse unverified. |
| `9d260dd464be230a43abc9d297edb0921f973b8e` | `.next/prerender-manifest.json` | generic-api-key | Generated Next.js build credential: rotate by fresh build and retire affected deployments; active reuse unverified. |
| `9d260dd464be230a43abc9d297edb0921f973b8e` | `.next/server/server-reference-manifest.json` | generic-api-key | Generated Next.js build credential: rotate by fresh build and retire affected deployments; active reuse unverified. |

## Scope and exclusions

Includes all branch/tag refs advertised and fetched from the repository origin at scan time (95 refs in the job), all commits reachable by `git log --all --full-history`, default Gitleaks rules and a targeted old-provider-name/endpoint/private-key-marker search. It excludes deleted/unreachable objects, unfetched forks, hosting settings/logs, secret-manager values, local untracked files and later commits. The terminal's partial-clone scan was stopped; the completed full clone scan in CI supplies the history evidence. Scanner rules cannot prove the absence of every possible secret.

## Current hosting metadata

Vercel Production still has `JAAS_APP_ID`, `JAAS_KEY_ID`, `JAAS_PRIVATE_KEY`; delete them at verified hybrid cutover and revoke the old JaaS credential. Preview/Development have no observed old meeting keys. Inspected Cloudflare Workers `aerotech`, `aerotech-staging`, `aerotech-reviews` have no old meeting secret names. GitHub/Codespaces secret APIs are unavailable to the connected GitHub app and `gh` is unauthenticated: those secret inventories remain unverified. In GitHub inspect repository Settings → Secrets and variables → Actions / Codespaces, and each environment. Also inspect personal Codespaces secrets and any organisation-level secrets accessible to the repository. Delete retired provider names only after live dependency is removed.

## History rewrite proposal — NOT executed

First rotate/revoke exposed credentials and preserve a secured backup. Agree with collaborators on a maintenance window; enumerate affected manifests/paths and sensitive literal replacements privately. Use `git filter-repo` on a fresh mirror, validate that branches/tags and required release assets survive, rescan, then explicitly approve coordinated force-push. All affected commit IDs change; collaborators must re-clone or carefully rebase, open PRs and deployment commit links can break, and forks/caches keep copies. Ask GitHub support about cached sensitive data where appropriate. No filter-repo/BFG/force-push or destructive branch deletion was run.

## Repeatable owner commands

```bash
git fetch origin '+refs/heads/*:refs/remotes/origin/*' '+refs/tags/*:refs/tags/*'
node scripts/scan-meetings-history.mjs /path/to/gitleaks
# Metadata-only result: /tmp/aerotech-history-metadata.json
# Check inventories locally; never paste values:
gh secret list --repo drewhlly/Aerotech
gh secret list --app codespaces --repo drewhlly/Aerotech
```

Continuation: run 44579107292 repeated the full scan on source revision `23445573`, covering 96 fetched refs with the same 26 findings. The security job remains failed intentionally. No credential rotation, history rewrite or destructive cleanup was performed.
