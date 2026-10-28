CREATE TABLE IF NOT EXISTS payroll_stage_approvers (
 employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 stage TEXT NOT NULL CHECK(stage IN ('hr','finance','management','ceo')),
 employee_id UUID NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
 PRIMARY KEY(employer_id,stage),UNIQUE(employer_id,employee_id)
);
CREATE TABLE IF NOT EXISTS payroll_stage_reviews (
 id UUID PRIMARY KEY, employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
 stage TEXT NOT NULL CHECK(stage IN ('hr','finance','management','ceo')),
 reviewer_employee_id UUID NOT NULL REFERENCES workforce_employees(id),
 decision TEXT NOT NULL CHECK(decision IN ('approved','rejected')),
 note TEXT, reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),UNIQUE(run_id,stage)
);
CREATE UNIQUE INDEX IF NOT EXISTS payroll_run_tenant_id ON payroll_runs(employer_id,id);
CREATE UNIQUE INDEX IF NOT EXISTS payroll_employee_tenant_id ON workforce_employees(employer_id,id);
ALTER TABLE payroll_stage_approvers ADD CONSTRAINT payroll_stage_approver_tenant FOREIGN KEY (employer_id,employee_id) REFERENCES workforce_employees(employer_id,id);
ALTER TABLE payroll_stage_reviews ADD CONSTRAINT payroll_review_tenant FOREIGN KEY (employer_id,reviewer_employee_id) REFERENCES workforce_employees(employer_id,id);
ALTER TABLE payroll_stage_reviews ADD CONSTRAINT payroll_review_run_tenant FOREIGN KEY (employer_id,run_id) REFERENCES payroll_runs(employer_id,id);
