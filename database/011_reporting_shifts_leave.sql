CREATE TABLE IF NOT EXISTS workforce_departments (
 id UUID PRIMARY KEY, employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 name TEXT NOT NULL, line_manager_employee_id UUID REFERENCES workforce_employees(id),
 UNIQUE(employer_id,name)
);
CREATE TABLE IF NOT EXISTS workforce_shifts (
 id UUID PRIMARY KEY, employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 employee_id UUID NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
 assigned_by UUID NOT NULL REFERENCES workforce_employees(id),
 work_date DATE NOT NULL, starts_at TIME NOT NULL, ends_at TIME NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(employee_id,work_date)
);
ALTER TABLE workforce_employees ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES workforce_departments(id);
ALTER TABLE workforce_employees ADD COLUMN IF NOT EXISTS manager_employee_id UUID REFERENCES workforce_employees(id);
ALTER TABLE employee_requests ADD COLUMN IF NOT EXISTS reviewed_by_employee_id UUID REFERENCES workforce_employees(id);
