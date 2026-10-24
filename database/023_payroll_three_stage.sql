UPDATE payroll_runs SET status='awaiting_ceo' WHERE status='awaiting_management';
DELETE FROM payroll_stage_approvers WHERE stage='management';
DROP VIEW IF EXISTS payable_payroll_runs;
CREATE VIEW payable_payroll_runs AS
SELECT r.* FROM payroll_runs r
WHERE r.status='approved'
AND (SELECT COUNT(DISTINCT v.stage) FROM payroll_stage_reviews v
WHERE v.run_id=r.id AND v.employer_id=r.employer_id AND v.decision='approved'
AND v.stage IN ('hr','finance','ceo'))=3;
