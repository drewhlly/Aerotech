# Engineering issue register
Updated 25 November 2026. Evidence is not substituted for production acceptance.

| Priority | Finding | Evidence | Next action |
|---|---|---|---|
| High | Backup restore target lacks pgvector; four consecutive failures reported | Actions run 45141880951, job 137581617255: vector extension unavailable | Tier 2 disposable-container fix prepared using pgvector 0.8.7 / PostgreSQL 18; do not run production backup here |
| High | Historical generated credentials require rotation review | Last readiness report cites run 44582279825; no fresh full-history scan this activation | Security owner review; no history rewrite |
| High | Signed-in route audit reduced from nine findings to three | Run 45503639487 on 68fedbd3: three non-manager review-page findings; face schema setup resolved six | Page guard matching existing manager predicate prepared in 6fb2198; fresh checks pending |
| High | Vercel preview resource provisioning failure | Prior readiness report; separate Neon branch quota diagnosis | Verify integration capacity without deleting branches |
| High | Full payroll annual/joiner/leaver worked examples absent | Only existing statutory smoke examples confirmed | Tier 2 accountant-approved expected values and effective-dated configuration |
| Medium | Approved charter and named workflow suite absent on starting main | main 44239577 tree | Activation PR; settings/credentials owner actions |

Attempt ledger: backup log inspected once; no production operation attempted. Activation workflow runs: blocked by unauthenticated CLI and connector capability, not three failed fix attempts. Create needs-human after three actual repair attempts; do not invent attempts.
