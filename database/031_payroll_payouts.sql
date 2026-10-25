CREATE TABLE IF NOT EXISTS payroll_payout_accounts (
 employer_id UUID PRIMARY KEY REFERENCES employer_accounts(id), encrypted_key TEXT NOT NULL,
 mode TEXT NOT NULL CHECK(mode IN ('test','live')), connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE payroll_transfer_intents ADD COLUMN IF NOT EXISTS transfer_code TEXT;
ALTER TABLE payroll_transfer_intents ADD COLUMN IF NOT EXISTS provider_status TEXT;
ALTER TABLE payroll_transfer_intents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE payroll_transfer_intents ADD COLUMN IF NOT EXISTS released_by UUID REFERENCES workforce_employees(id);
ALTER TABLE payroll_transfer_recipients ADD COLUMN IF NOT EXISTS account_fingerprint TEXT;
ALTER TABLE payroll_transfer_recipients ADD COLUMN IF NOT EXISTS bank_code TEXT;
ALTER TABLE payroll_transfer_intents DROP CONSTRAINT IF EXISTS payroll_transfer_intents_status_check;
ALTER TABLE payroll_transfer_intents ADD CONSTRAINT payroll_transfer_intents_status_check CHECK(status IN ('ready','submitted','otp','pending','success','failed','reversed'));
CREATE TABLE IF NOT EXISTS payroll_payout_audit (
 id UUID PRIMARY KEY, employer_id UUID NOT NULL REFERENCES employer_accounts(id), run_id UUID REFERENCES payroll_runs(id),
 actor_id UUID, action TEXT NOT NULL, details JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
