ALTER TABLE employee_training_records ADD COLUMN IF NOT EXISTS content_url TEXT;
ALTER TABLE employee_training_records ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE employee_training_records ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE employee_document_records ADD COLUMN IF NOT EXISTS expiry_date DATE;

CREATE TABLE IF NOT EXISTS employee_face_references (
 employee_id UUID PRIMARY KEY REFERENCES workforce_employees(id), employer_id UUID NOT NULL REFERENCES employer_accounts(id),
 image BYTEA NOT NULL, consent_recorded_at TIMESTAMPTZ NOT NULL, approved_by UUID NOT NULL REFERENCES employer_accounts(id),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
