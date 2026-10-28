# Aerotech HR feature parity roadmap (original implementation)

This document captures publicly described PaidHR-style feature categories as requirements for Aerotech's own design, not copied code or branding.

## Committed foundations (not certified live)
- Employer signup/login and employer-scoped employee directory/add/profile endpoints.
- Applicant account gate, candidate import API and basic recruitment screens.
- Payroll draft calculation and Nigerian statutory calculation preview; HR -> Finance -> Management -> CEO approvals under development.
- Payroll Wallet says Coming Soon; no disbursement.
- Employer AI model API route, requiring OPENAI_API_KEY; no company record reasoning yet.
- Employee requests database, tenant-scoped request API, employer review endpoint and dashboard.
- Employee asset/task/disciplinary record tables (database only).
- Employee probation/confirmation table (database only).

## Functionality to build and test next
1. Employee self-service sessions and employee-authorized request creation (currently employer authenticated, not employee self-service).
2. Leave balances, policies, accrued entitlements, holiday calendars, HR approvals and attendance sync.
3. Attendance clock in/out, shifts, corrections, verification and integrations.
4. Payroll scheduler, exception reporting, genuine individual approver identities, payroll tax validation, bank payouts only after regulator/provider approval.
5. Payslips, taxes and statutory remittance providers, cross-border jurisdiction-specific calculations.
6. Recruitment ATS pipeline, interviews, job requisition approval, applicant communications.
7. Onboarding/offboarding workflows, digital document issuance/signature, templates and secure storage.
8. Performance goals/OKRs, cycles, reviews, feedback, training, surveys.
9. Asset issue/return UI, disciplinary case workflows, audit trail, custom reports.
10. Roles, permissions, notifications, configurable workflows, calendar and APIs.
11. Financial benefits, earned wage access, loans and wallets only after legal/regulatory and payment integrations.

## Pre-launch acceptance
- Apply and verify migrations on a PostgreSQL instance; configure DATABASE_URL.
- Configure OPENAI_API_KEY privately on host; do not commit credentials.
- Run CI and end-to-end tests for signup, saved employees, tenant isolation, approval authorization, request flows and AI.
- Test payroll against tax counsel validated country rules; verify no money can be paid using demo wallets.
- Remove or clearly label remaining mock functionality.

Reference categories: https://www.paidhr.com/pricing , https://www.paidhr.com/platform/hr-tools-workflows , https://support.paidhr.com/getting-started-with-paidhr .
