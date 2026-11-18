# Aerotech payroll audit and statutory rules

Audit of `main` at `8e85972`, 18 November 2026.

## Wallet and provider transfers

The employer wallet route displayed a placeholder. An additional demonstration UI simulated funding, balances and entries. The live payroll payments workspace implemented Paystack connection, beneficiary records, transfer preparation and release, OTP finalization, reconciliation and a webhook. The employer dashboard, navigation, employee approval pages, legal copy, scripts and tests referenced those flows.

Read-only exact row counts on the default branch of each connected Neon project:

| Table | `neondb` | `aerotech_staging` |
| --- | ---: | ---: |
| `payroll_payout_accounts` | 0 | 0 |
| `payroll_payout_audit` | 0 | 0 |
| `payroll_transfer_intents` | 0 | 0 |
| `payroll_transfer_recipients` | 0 | 0 |

The removal commit is `a3b6cff`. Run `git show --name-status a3b6cff` for the file inventory. Migration 047 locks all four tables, checks them again and aborts on any stored row. Existing migrations and point-in-time audit evidence are retained. The historical migration runner validates checksums. No database migration was applied to either connected database and no populated tables were found to export.

## Payroll before and after

| Area | Existing implementation | Changes and remaining gaps |
| --- | --- | --- |
| Storage and compensation | PostgreSQL via `pg`; monthly amounts, core trio, fixed salary bands, employee links and flags. Setup overwrites current salary. | Run items now save a statutory snapshot. Pay components, effective-dated salary history, statutory identifiers and evidence collection remain open. Existing rent amounts qualify only after evidence is verified. |
| Calculation | Flat annualization of current gross, core-trio pension, optional NHF and sanctions. The active calculator already used the 2026 bands. No active CRA or legacy 7–24% band logic was found. | Effective-dated rules and per-band working added. YTD, joiner/leaver proration, overtime, unpaid leave, actual attendance input, arrears, variable pay, loans and remaining relief categories are open. The historic minimum-wage gross override was removed. Minimum-wage eligibility still needs its own evidenced classification. Existing explicit tax-exemption selections need review. |
| Period and approvals | One run per employer per calendar month; preparation immediately enters HR, Finance and CEO review. Assigned employees sign in independently; each decision records reviewer and time. | Approved totals and items now immutable in PostgreSQL. Separate payment record closes payment recording. There is no independent maker identity, configurable number of approval stages, draft/review gate, reversal or off-cycle adjustment. |
| Schedules and payslips | Month-based statements and employee-scoped payslip views, notification worker and employer run summaries. | Approved-run bank CSV, export timestamp and manual payment date/reference added. Bank data comes from the current employee profile. An approved bank-detail snapshot, account ownership verification, bank-specific file acceptance, new employee PDF output, statutory schedules, Excel/PDF reports and year-end tax summaries remain open. |
| Automation | Scheduler prepares the previous month; existing payslip notification job. | Input/review/approval and remittance calendar, reminders, cutoff locking, carry-forward and year-end close remain open. |
| Security and dashboard | Tenant-scoped queries, employer session and employee approver/own-statement checks. Dashboard shows latest month and totals. | Removed transfer routes. Bank CSV is employer-session and tenant scoped. Payroll-specific roles, individual export actor attribution, comprehensive salary and bank audit, masking and field encryption, retention, remittance dashboard and full stepper remain open. |

## Nigeria rules from January 2026

| Rule | Verified source and application | Implementation status |
| --- | --- | --- |
| PAYE bands | [Nigeria Tax Act 2025, s. 58 and Fourth Schedule](https://nass.gov.ng/documents/download/11249). Marginal bands 0% through ₦800,000; 15% through ₦3m; 18% through ₦12m; 21% through ₦25m; 23% through ₦50m; 25% above ₦50m. | Configured, with band amounts and tax recorded. Section 58 separately treats qualifying minimum-wage earners. |
| Rent | [Nigeria Tax Act 2025, ss. 30–32](https://nass.gov.ng/documents/download/11249). 20% of actual annual rent, capped at ₦500,000. Act requires accurate declaration and information prescribed by the relevant tax authority. | Defaults to zero unless evidence is verified. Evidence upload and review UI remain open. |
| Other eligible deductions | [Nigeria Tax Act 2025, s. 30](https://nass.gov.ng/documents/download/11249). Eligible employee pension, NHF and health insurance contributions, qualifying owner-occupied residential construction loan interest and qualifying prior-year life premiums/annuities. | Employee pension and NHF applied. Other deductions and evidence collection remain open. |
| Pension | [Pension Reform Act 2014, ss. 4, 11 and 120](https://www.pencom.gov.ng/wp-content/uploads/2018/01/PRA_2014.pdf). Minimum employee 8% and employer 10% of contractual monthly emoluments, at least basic, housing and transport. Remit to the PFC designated by the employee’s PFA within seven working days after payment. | Rates and core base configured. Tenant-specific pensionable components, applicability workflow and PFA schedule remain open. |
| NHF | [Business Facilitation Act, Schedule para. 45](https://admin.theiguides.org/Media/Documents/Business%20Facilitation%20Misc%20Provisions%20Act%202022.pdf). 2.5% of monthly income; private-sector participation is voluntary under the amendment. | Opt-in monthly income rule configured. Confirm makeup of monthly income for unusual earnings with FMBN. |
| NSITF | [NSITF Employee Compensation Scheme](https://nsitf.gov.ng/services) states 1% of total monthly payroll. | Rate configured; per-line estimate stored. Confirm the treatment of exceptional pay and tenant assessment before generating schedules. |
| ITF | [ITF Act, s. 6 and ITF employer guidance](https://www.itf.gov.ng/employer_reg/). 1% of annual payroll for employers with at least five employees or ₦50m annual turnover. | Verified; tenant eligibility toggle and annual schedule remain open. Confirm the filing calendar against current ITF instructions. |
| Group life/NHIA | [Pension Reform Act 2014 s. 4(5)](https://www.pencom.gov.ng/wp-content/uploads/2018/01/PRA_2014.pdf) requires applicable group life cover of at least three times annual total emoluments. Health insurance terms depend on the applicable scheme. | Group life verified; employer premium tracking and health scheme rates remain open. |
| PAYE dates | [Joint Revenue Board 2026 PIT Guidelines](https://cms-api.jrb.gov.ng/api/publication-assets/file/2026-pit-guidelines-TJG3n9-T%20%281%29.pdf) and [LIRS FAQ](https://lirs.gov.ng/faq). PAYE by the 10th of the following month; employer annual returns by 31 January. | Calendar and relevant-authority routing remain open. |
| Variable pay and exit payments | [JRB Guidelines, para. 13](https://cms-api.jrb.gov.ng/api/publication-assets/file/2026-pit-guidelines-TJG3n9-T%20%281%29.pdf) require withholding on taxable non-periodic compensation. [Nigeria Tax Act, s. 50](https://nass.gov.ng/documents/download/11249) treats qualifying compensation for loss of office separately, with an exemption up to ₦50m. | Distinguish ordinary bonuses, 13th month and leave allowance from qualifying termination compensation and statutory retirement payments. Classification and calculation remain open. Obtain accountant review on gratuity, mixed severance packages, benefits in kind and local evidence requirements. |

## Worked PAYE tests

Amounts are NGN. The test fixtures isolate PAYE by disabling eligible pension and NHF contributions unless stated.

| Monthly gross | Annual rent relief | Annual chargeable income | Annual PAYE | Monthly PAYE |
| ---: | ---: | ---: | ---: | ---: |
| 65,000 | 0 | 780,000 | 0 | 0 |
| 100,000 | 0 | 1,200,000 | 60,000 | 5,000 |
| 250,000 | 0 | 3,000,000 | 330,000 | 27,500 |
| 300,000 | 0 | 3,600,000 | 438,000 | 36,500 |
| 500,000 | 0 | 6,000,000 | 870,000 | 72,500 |
| 500,000 | 500,000 | 5,500,000 | 780,000 | 65,000 |
| 5,000,000 | 0 | 60,000,000 | 12,930,000 | 1,077,500 |

No production certification or deployment. The twelve-month PAYE reconciliation scenarios require the unfinished YTD workflow.

## Local verification

- ESLint, TypeScript and the Next.js production build passed.
- 62 unit tests and 32 integration suites passed, including approved-run immutability, duplicate-month constraint, empty-table cleanup, foreign-tenant export/payment denial and duplicate payment denial.
- Local HTTP requests confirmed the old wallet URL family redirects to employer Payroll. The removed payment API returns 404 and unauthenticated bank schedule access returns 401.
- An isolated Cloudflare-targeted vinext build passed. It used explicit no-cache and no-image-optimization flags for the build. The current hosted workflow initializer needs updated options before it can run unattended. Hosted Vercel and Cloudflare deploys were not run.
- No project dependency was added. The Cloudflare test adapter packages were installed only in the isolated build workspace.

## Wallet removal file inventory

```text
M	.env.example
M	.github/workflows/signed-in-verification.yml
M	AEROTECH-FRONTEND-COMPLETE.md
M	AEROTECH-PRODUCTION-ROADMAP.md
A	database/047_remove_payroll_transfers.sql
M	docs/environment-inventory.md
M	docs/hr-feature-parity-roadmap.md
M	docs/payroll-country-compliance.md
M	docs/releases/2026-10-29-live-pricing.md
M	next.config.ts
M	package.json
M	scripts/migrate.mjs
M	scripts/verify-signed-in.mjs
M	src/app/(public)/solutions/page.tsx
M	src/app/api/admin/readiness/route.ts
D	src/app/api/payroll/payments/connection/route.ts
D	src/app/api/payroll/payments/finalize/route.ts
D	src/app/api/payroll/payments/prepare/route.ts
D	src/app/api/payroll/payments/recipients/route.ts
D	src/app/api/payroll/payments/reconcile/route.ts
D	src/app/api/payroll/payments/release/route.ts
D	src/app/api/payroll/payments/route.ts
D	src/app/api/payroll/payments/webhook/[employerId]/route.ts
M	src/app/dashboard/employer/page.tsx
M	src/app/dashboard/employer/payroll/approvers/page.tsx
M	src/app/dashboard/employer/payroll/page.tsx
M	src/app/dashboard/employer/payroll/pay/page.tsx
D	src/app/dashboard/employer/payroll/wallet/page.tsx
M	src/app/employee/approvals/page.tsx
D	src/app/employee/approvals/payments/page.tsx
D	src/app/employee/payroll/payments/page.tsx
M	src/components/aerotech-workforce-os.tsx
M	src/components/employee-nav.tsx
M	src/components/employee-profile-workspace.tsx
M	src/components/employer-nav.tsx
M	src/components/landing-showcase.tsx
D	src/components/payroll-payments.tsx
M	src/lib/aerotech.ts
M	src/lib/demo-access.ts
M	src/lib/employee-auth.ts
M	src/lib/employer-os.ts
M	src/lib/legal-content.ts
M	src/lib/payments.ts
D	src/lib/payout-readiness.ts
D	src/lib/payout-security.ts
D	src/lib/paystack-payouts.ts
M	src/lib/route-metadata.ts
M	src/proxy.ts
M	tests/demo-access.test.mjs
D	tests/payout-api.integration.mjs
D	tests/payout-readiness.test.mjs
D	tests/payout-security.test.mjs
M	tests/subscription-access.integration.mjs
```
