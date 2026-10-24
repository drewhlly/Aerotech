ALTER TABLE workforce_employees ADD COLUMN IF NOT EXISTS date_of_birth DATE;
CREATE TABLE IF NOT EXISTS birthday_notification_log (
 employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 employee_id UUID NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
 celebration_year INTEGER NOT NULL,
 notified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 PRIMARY KEY (employer_id,employee_id,celebration_year)
);
