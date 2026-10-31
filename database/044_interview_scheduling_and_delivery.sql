-- New workflow records only; existing interviews and employee accounts are retained.
CREATE TABLE IF NOT EXISTS recruitment_interview_slots (
 id UUID PRIMARY KEY,employer_id UUID NOT NULL REFERENCES employer_accounts(id),job_id UUID NOT NULL REFERENCES ats_jobs(id),
 starts_at TIMESTAMPTZ NOT NULL,ends_at TIMESTAMPTZ NOT NULL,interviewer_employee_id UUID REFERENCES workforce_employees(id),
 status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','booked','cancelled')),application_id UUID REFERENCES ats_applications(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),CHECK(ends_at>starts_at),CHECK((status='booked')=(application_id IS NOT NULL)),UNIQUE NULLS NOT DISTINCT(employer_id,job_id,starts_at,interviewer_employee_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS recruitment_slot_application ON recruitment_interview_slots(application_id) WHERE application_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS recruitment_slots_open ON recruitment_interview_slots(employer_id,job_id,starts_at) WHERE status='open';
ALTER TABLE ats_applications ADD COLUMN IF NOT EXISTS interview_revision INTEGER NOT NULL DEFAULT 0;
ALTER TABLE ats_jobs ADD COLUMN IF NOT EXISTS assessment_reviewed_at TIMESTAMPTZ;
ALTER TABLE ats_jobs ADD COLUMN IF NOT EXISTS assessment_review_notes TEXT NOT NULL DEFAULT '';
