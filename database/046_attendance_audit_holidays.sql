-- Tenant-scoped attendance holiday calendar and immutable correction history.
CREATE TABLE IF NOT EXISTS attendance_holidays (
 id UUID PRIMARY KEY,
 employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 work_date DATE NOT NULL,
 name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 2 AND 150),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(employer_id,work_date)
);
CREATE TABLE IF NOT EXISTS attendance_event_corrections (
 id UUID PRIMARY KEY,
 employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 employee_id UUID NOT NULL REFERENCES workforce_employees(id) ON DELETE RESTRICT,
 event_id UUID NOT NULL REFERENCES hr_attendance_events(id) ON DELETE RESTRICT,
 actor_employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE RESTRICT,
 old_event_time TIMESTAMPTZ NOT NULL,
 new_event_time TIMESTAMPTZ NOT NULL,
 reason TEXT NOT NULL CHECK(length(trim(reason)) BETWEEN 10 AND 1000),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS attendance_corrections_employer_event ON attendance_event_corrections(employer_id,event_id,created_at DESC);
