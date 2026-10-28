-- Phase 2: replace pre-publication review with immediate publication and post-publication safeguards.
ALTER TABLE ats_jobs DROP CONSTRAINT IF EXISTS ats_jobs_status_check;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ats_jobs' AND column_name='approval_status') THEN
  EXECUTE 'UPDATE ats_jobs SET status=''published'' WHERE status IN (''open'',''pending'') OR (status=''draft'' AND approval_status=''pending'')';
 ELSE
  UPDATE ats_jobs SET status='published' WHERE status IN ('open','pending');
 END IF;
END $$;
ALTER TABLE ats_jobs ADD CONSTRAINT ats_jobs_status_check CHECK(status IN ('draft','published','closed','expired','archived'));
ALTER TABLE ats_jobs DROP COLUMN IF EXISTS approval_status;
ALTER TABLE ats_jobs DROP COLUMN IF EXISTS approval_note;
ALTER TABLE ats_jobs DROP COLUMN IF EXISTS approved_at;
ALTER TABLE ats_jobs DROP COLUMN IF EXISTS approved_by;
ALTER TABLE company_workflow_settings DROP COLUMN IF EXISTS vacancy_approver_employee_id;
ALTER TABLE ats_jobs ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE ats_jobs ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE ats_jobs ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ;
ALTER TABLE ats_jobs ADD COLUMN IF NOT EXISTS expiry_days INTEGER NOT NULL DEFAULT 30 CHECK(expiry_days BETWEEN 1 AND 90);
ALTER TABLE ats_jobs ADD COLUMN IF NOT EXISTS fingerprint TEXT;
ALTER TABLE ats_jobs ADD COLUMN IF NOT EXISTS remote BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE ats_jobs ADD COLUMN IF NOT EXISTS salary_min NUMERIC(15,2);
ALTER TABLE ats_jobs ADD COLUMN IF NOT EXISTS salary_max NUMERIC(15,2);
ALTER TABLE ats_jobs ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'NGN';
UPDATE ats_jobs SET published_at=COALESCE(published_at,NOW()),expires_at=COALESCE(expires_at,NOW()+INTERVAL '30 days') WHERE status='published';
CREATE INDEX IF NOT EXISTS job_publication_search ON ats_jobs(status,expires_at,published_at DESC);
CREATE TABLE IF NOT EXISTS job_publication_events(id UUID PRIMARY KEY,employer_id UUID NOT NULL REFERENCES employer_accounts(id),job_id UUID NOT NULL REFERENCES ats_jobs(id),created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX IF NOT EXISTS job_publication_limit ON job_publication_events(employer_id,created_at);
CREATE TABLE IF NOT EXISTS job_reports(id UUID PRIMARY KEY,job_id UUID NOT NULL REFERENCES ats_jobs(id),reporter_hash TEXT NOT NULL,reason TEXT NOT NULL,details TEXT NOT NULL DEFAULT '',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),UNIQUE(job_id,reporter_hash));
CREATE TABLE IF NOT EXISTS platform_alerts(id UUID PRIMARY KEY,source_key TEXT UNIQUE NOT NULL,title TEXT NOT NULL,details TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS platform_job_settings(id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK(id),report_threshold INTEGER NOT NULL DEFAULT 5 CHECK(report_threshold BETWEEN 3 AND 100),posts_per_day INTEGER NOT NULL DEFAULT 10 CHECK(posts_per_day BETWEEN 1 AND 100));
INSERT INTO platform_job_settings(id) VALUES(TRUE) ON CONFLICT DO NOTHING;
ALTER TABLE employer_accounts ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE employer_accounts ADD COLUMN IF NOT EXISTS company_verified_at TIMESTAMPTZ;
CREATE TABLE IF NOT EXISTS employer_email_verifications(token_hash TEXT PRIMARY KEY,employer_id UUID NOT NULL REFERENCES employer_accounts(id),expires_at TIMESTAMPTZ NOT NULL,used_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS policy_acceptances(id UUID PRIMARY KEY,account_role TEXT NOT NULL,account_id UUID NOT NULL,policy_version TEXT NOT NULL,accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS cookie_consents(id UUID PRIMARY KEY,visitor_id UUID NOT NULL,version TEXT NOT NULL,preferences BOOLEAN NOT NULL,analytics BOOLEAN NOT NULL,marketing BOOLEAN NOT NULL,recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS privacy_requests(id UUID PRIMARY KEY,account_role TEXT NOT NULL,account_id UUID NOT NULL,employer_id UUID,request_type TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'received' CHECK(status IN ('received','identity_check','in_progress','fulfilled','declined')),details TEXT NOT NULL DEFAULT '',response TEXT NOT NULL DEFAULT '',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),due_at TIMESTAMPTZ NOT NULL DEFAULT NOW()+INTERVAL '30 days',updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS privacy_audit(id UUID PRIMARY KEY,account_role TEXT NOT NULL,account_id UUID NOT NULL,action TEXT NOT NULL,request_id UUID REFERENCES privacy_requests(id),created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
-- Historical acknowledgement evidence is retained for legal review, but is no longer collected or used as an access guard.
UPDATE employee_onboarding_tasks SET status='completed' WHERE title='Review company confidentiality agreement';
DELETE FROM employee_notifications WHERE source_key='onboarding-start';
ALTER TABLE employer_email_verifications ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE employer_accounts ADD COLUMN IF NOT EXISTS company_verified_by UUID REFERENCES support_agents(id);
CREATE TABLE IF NOT EXISTS company_verification_audit(id UUID PRIMARY KEY,employer_id UUID NOT NULL REFERENCES employer_accounts(id),admin_id UUID NOT NULL REFERENCES support_agents(id),evidence TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());

ALTER TABLE company_workflow_settings DROP COLUMN IF EXISTS confidentiality_title;
ALTER TABLE company_workflow_settings DROP COLUMN IF EXISTS confidentiality_text;
ALTER TABLE company_workflow_settings DROP COLUMN IF EXISTS confidentiality_version;
