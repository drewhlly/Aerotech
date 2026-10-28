ALTER TABLE payroll_employees ADD COLUMN IF NOT EXISTS email TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS payroll_employee_email_tenant_unique ON payroll_employees(employer_id,LOWER(email)) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS payroll_employee_email_lookup ON payroll_employees(employer_id,LOWER(email));
