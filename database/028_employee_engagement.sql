CREATE TABLE IF NOT EXISTS anonymous_company_feedback(id UUID PRIMARY KEY,employer_id UUID NOT NULL REFERENCES employer_accounts(id),message TEXT NOT NULL CHECK(length(message) BETWEEN 10 AND 2000),submitted_date DATE NOT NULL DEFAULT CURRENT_DATE);
CREATE INDEX IF NOT EXISTS anonymous_feedback_employer ON anonymous_company_feedback(employer_id,submitted_date);
ALTER TABLE employee_notifications ADD COLUMN IF NOT EXISTS source_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS employee_notifications_source ON employee_notifications(employer_id,employee_id,source_key) WHERE source_key IS NOT NULL;
