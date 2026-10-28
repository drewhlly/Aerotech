CREATE TABLE IF NOT EXISTS employee_private_profiles (
 employee_id UUID PRIMARY KEY REFERENCES workforce_employees(id) ON DELETE CASCADE,
 employer_id UUID NOT NULL,
 details JSONB NOT NULL DEFAULT '{}'::jsonb,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_employee_private_profiles_employer ON employee_private_profiles(employer_id);
