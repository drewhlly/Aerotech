-- Leave category is nullable to preserve historical requests without guessing.
ALTER TABLE employee_requests ADD COLUMN IF NOT EXISTS leave_category TEXT;
ALTER TABLE employee_requests ADD CONSTRAINT employee_requests_leave_category_check CHECK (leave_category IS NULL OR leave_category IN ('annual','sick','maternity','paternity','compassionate','study','unpaid','other'));
