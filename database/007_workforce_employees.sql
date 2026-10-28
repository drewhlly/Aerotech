CREATE TABLE IF NOT EXISTS workforce_employees (
 id UUID PRIMARY KEY,
 employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 employee_number TEXT,
 first_name TEXT NOT NULL,
 last_name TEXT NOT NULL,
 email TEXT NOT NULL,
 phone TEXT,
 job_title TEXT NOT NULL,
 department TEXT NOT NULL,
 location TEXT,
 employment_status TEXT NOT NULL DEFAULT 'active' CHECK(employment_status IN ('active','probation','on_leave','notice','terminated')),
 hire_date DATE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(employer_id,email)
);
CREATE INDEX IF NOT EXISTS workforce_employees_employer_idx ON workforce_employees(employer_id,created_at);
