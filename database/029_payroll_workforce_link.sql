ALTER TABLE payroll_employees ADD COLUMN IF NOT EXISTS workforce_employee_id UUID REFERENCES workforce_employees(id);
CREATE UNIQUE INDEX IF NOT EXISTS payroll_workforce_identity ON payroll_employees(employer_id,workforce_employee_id) WHERE workforce_employee_id IS NOT NULL;
