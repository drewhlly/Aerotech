-- Aerotech original HR workflow modules, tenant scoped.
CREATE TABLE IF NOT EXISTS employee_requests (
 id UUID PRIMARY KEY,
 employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 employee_id UUID NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
 request_type TEXT NOT NULL CHECK(request_type IN ('leave','loan','salary_advance','redeployment','exit','document','expense')),
 start_date DATE,
 end_date DATE,
 details TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 reviewed_at TIMESTAMPTZ,
 reviewed_by UUID REFERENCES employer_accounts(id),
 review_note TEXT,
 CHECK(end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);
CREATE INDEX IF NOT EXISTS employee_requests_tenant_status ON employee_requests(employer_id,status,created_at);
CREATE TABLE IF NOT EXISTS employee_assets (
 id UUID PRIMARY KEY,
 employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 employee_id UUID NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
 name TEXT NOT NULL, serial_number TEXT, assigned_at DATE NOT NULL DEFAULT CURRENT_DATE, returned_at DATE,
 notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS employee_tasks (
 id UUID PRIMARY KEY,
 employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 employee_id UUID NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
 title TEXT NOT NULL, due_date DATE,
 status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_progress','completed')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS employee_disciplinary_cases (
 id UUID PRIMARY KEY, employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 employee_id UUID NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
 category TEXT NOT NULL, description TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','under_review','closed')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
