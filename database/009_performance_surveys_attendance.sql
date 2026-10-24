CREATE TABLE IF NOT EXISTS hr_surveys (
 id UUID PRIMARY KEY,employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 title TEXT NOT NULL,question TEXT NOT NULL,active BOOLEAN NOT NULL DEFAULT TRUE,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS hr_survey_responses (
 id UUID PRIMARY KEY,survey_id UUID NOT NULL REFERENCES hr_surveys(id) ON DELETE CASCADE,
 employee_id UUID NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
 rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),comment TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(survey_id,employee_id)
);
CREATE TABLE IF NOT EXISTS hr_performance_goals (
 id UUID PRIMARY KEY,employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 employee_id UUID NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
 title TEXT NOT NULL,description TEXT,target_date DATE,
 progress INTEGER NOT NULL DEFAULT 0 CHECK(progress BETWEEN 0 AND 100),
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','completed','cancelled')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS hr_attendance_events (
 id UUID PRIMARY KEY,employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 employee_id UUID NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
 work_date DATE NOT NULL,event_type TEXT NOT NULL CHECK(event_type IN ('clock_in','clock_out')),
 event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 source TEXT NOT NULL DEFAULT 'employer_entry',
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(employee_id,work_date,event_type)
);
CREATE INDEX IF NOT EXISTS hr_attendance_tenant_date ON hr_attendance_events(employer_id,work_date);
