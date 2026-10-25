CREATE TABLE IF NOT EXISTS ats_jobs (
 id UUID PRIMARY KEY, employer_id UUID NOT NULL REFERENCES employer_accounts(id), title TEXT NOT NULL,
 department TEXT NOT NULL, location TEXT NOT NULL, country TEXT NOT NULL, employment_type TEXT NOT NULL,
 description TEXT NOT NULL, requirements TEXT NOT NULL DEFAULT '', status TEXT NOT NULL CHECK(status IN ('draft','open','closed')),
 questions JSONB NOT NULL DEFAULT '[]', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ats_applications (
 id UUID PRIMARY KEY, job_id UUID NOT NULL REFERENCES ats_jobs(id), applicant_id UUID NOT NULL REFERENCES applicant_accounts(id),
 stage TEXT NOT NULL DEFAULT 'applied' CHECK(stage IN ('applied','screening','shortlisted','assessment','interview','offer','hired','rejected')),
 cv_text TEXT NOT NULL, assessment_score INT, answers JSONB, interview_at TIMESTAMPTZ, interview_details TEXT,
 feedback TEXT NOT NULL DEFAULT '', employee_id UUID REFERENCES workforce_employees(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(job_id,applicant_id)
);
CREATE TABLE IF NOT EXISTS ats_events (
 id UUID PRIMARY KEY, application_id UUID NOT NULL REFERENCES ats_applications(id), stage TEXT NOT NULL,
 message TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ats_jobs_employer ON ats_jobs(employer_id);
CREATE INDEX IF NOT EXISTS ats_applications_applicant ON ats_applications(applicant_id);
