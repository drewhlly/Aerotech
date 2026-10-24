-- Pulse survey privacy and scheduling additions
ALTER TABLE hr_surveys ADD COLUMN IF NOT EXISTS anonymous BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE hr_surveys ADD COLUMN IF NOT EXISTS closes_at TIMESTAMPTZ;
ALTER TABLE hr_surveys ADD COLUMN IF NOT EXISTS cadence TEXT NOT NULL DEFAULT 'once';
ALTER TABLE hr_survey_responses ADD COLUMN IF NOT EXISTS employee_id UUID;
CREATE UNIQUE INDEX IF NOT EXISTS hr_survey_one_response_per_employee ON hr_survey_responses(survey_id,employee_id) WHERE employee_id IS NOT NULL;
