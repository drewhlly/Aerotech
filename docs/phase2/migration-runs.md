# Migration runs

Production: **none**. No production database was connected for these tests.

Isolated SQL integration applied `018_aerotech_meet.sql` and `037_collaboration.sql` to a minimal fixture schema; migration 037 was applied twice to check idempotence. Browser fixtures applied all 37 registered migration files below to a fresh disposable database, in this order.

1. `001_employer_accounts.sql`
2. `002_employer_sessions.sql`
3. `003_applicant_accounts.sql`
4. `004_recruitment_payroll.sql`
5. `005_payroll_approvals.sql`
6. `006_nigeria_payroll.sql`
7. `007_workforce_employees.sql`
8. `008_hr_workflows.sql`
9. `009_performance_surveys_attendance.sql`
10. `010_attendance_verification.sql`
11. `011_reporting_shifts_leave.sql`
12. `012_employee_auth.sql`
13. `013_tenant_integrity.sql`
14. `014_employee_lifecycle.sql`
15. `015_payroll_individual_approvals.sql`
16. `016_payroll_transfers.sql`
17. `017_employee_birthdays.sql`
18. `018_aerotech_meet.sql`
19. `019_payroll_employee_identity.sql`
20. `021_support_console.sql`
21. `022_support_enrollment.sql`
22. `023_payroll_three_stage.sql`
23. `024_recruitment_live.sql`
24. `024_pulse_surveys.sql`
25. `025_employee_profiles.sql`
26. `026_camera_attendance.sql`
27. `027_documents_confirmations.sql`
28. `028_employee_engagement.sql`
29. `029_payroll_workforce_link.sql`
30. `030_portal_automation.sql`
31. `031_payroll_payouts.sql`
32. `032_salary_bands.sql`
33. `033_workflow_automation.sql`
34. `034_subscriptions_exits.sql`
35. `035_profile_date_consistency.sql`
36. `036_password_recovery.sql`
37. `037_collaboration.sql`
