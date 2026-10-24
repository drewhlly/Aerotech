CREATE TABLE IF NOT EXISTS payroll_transfer_recipients (
 employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 payroll_employee_id UUID NOT NULL REFERENCES payroll_employees(id) ON DELETE CASCADE,
 provider TEXT NOT NULL DEFAULT 'paystack',
 recipient_code TEXT NOT NULL,
 verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 PRIMARY KEY(employer_id,payroll_employee_id)
);
CREATE TABLE IF NOT EXISTS payroll_transfer_intents (
 id UUID PRIMARY KEY,
 employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
 payroll_employee_id UUID NOT NULL REFERENCES payroll_employees(id),
 amount_kobo BIGINT NOT NULL CHECK(amount_kobo>0),
 recipient_code TEXT NOT NULL,reference TEXT NOT NULL UNIQUE,
 status TEXT NOT NULL DEFAULT 'ready' CHECK(status IN ('ready','submitted','pending','success','failed','reversed')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(payroll_run_id,payroll_employee_id)
);
CREATE INDEX IF NOT EXISTS payroll_transfer_tenant ON payroll_transfer_intents(employer_id,payroll_run_id);
