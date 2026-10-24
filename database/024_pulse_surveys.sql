-- Add survey scheduling metadata. Responses already contain employee_id,
-- comment and a unique (survey_id, employee_id) constraint.
ALTER TABLE hr_surveys ADD COLUMN IF NOT EXISTS anonymous BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE hr_surveys ADD COLUMN IF NOT EXISTS closes_at TIMESTAMPTZ;
ALTER TABLE hr_surveys ADD COLUMN IF NOT EXISTS cadence TEXT NOT NULL DEFAULT 'once';
