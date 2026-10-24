ALTER TABLE payroll_employees ADD COLUMN IF NOT EXISTS basic_salary_ngn NUMERIC(15,2);
ALTER TABLE payroll_employees ADD COLUMN IF NOT EXISTS housing_allowance_ngn NUMERIC(15,2);
ALTER TABLE payroll_employees ADD COLUMN IF NOT EXISTS transport_allowance_ngn NUMERIC(15,2);
ALTER TABLE payroll_employees ADD COLUMN IF NOT EXISTS annual_rent_relief_ngn NUMERIC(15,2) DEFAULT 0;
ALTER TABLE payroll_employees ADD COLUMN IF NOT EXISTS nhf_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE payroll_employees ADD COLUMN IF NOT EXISTS pension_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE payroll_employees ADD COLUMN IF NOT EXISTS tax_exempt BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE payroll_run_items ADD COLUMN IF NOT EXISTS paye NUMERIC(15,2) NOT NULL DEFAULT 0;
ALTER TABLE payroll_run_items ADD COLUMN IF NOT EXISTS nhf NUMERIC(15,2) NOT NULL DEFAULT 0;
ALTER TABLE payroll_run_items ADD COLUMN IF NOT EXISTS sanctions NUMERIC(15,2) NOT NULL DEFAULT 0;
ALTER TABLE payroll_run_items ADD COLUMN IF NOT EXISTS employer_pension NUMERIC(15,2) NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS payroll_sanctions (
 id UUID PRIMARY KEY, employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 employee_id UUID NOT NULL REFERENCES payroll_employees(id) ON DELETE CASCADE,
 payroll_month DATE NOT NULL, amount_ngn NUMERIC(15,2) NOT NULL CHECK(amount_ngn>=0),
 reason TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
 approved_by UUID REFERENCES employer_accounts(id), created_at TIMESTAMPTZ DEFAULT NOW(),
 CHECK (status <> 'approved' OR approved_by IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS payroll_sanctions_lookup ON payroll_sanctions(employer_id,employee_id,payroll_month,status);
