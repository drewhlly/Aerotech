-- Demo access is not a Paystack payment and must never be represented as paid.
-- Existing active and expired subscriptions retain their current meaning.
ALTER TABLE company_subscriptions DROP CONSTRAINT IF EXISTS company_subscriptions_status_check;
ALTER TABLE company_subscriptions ADD CONSTRAINT company_subscriptions_status_check
  CHECK(status IN ('active','expired','demo'));
COMMENT ON COLUMN company_subscriptions.status IS
  'active: provider-verified paid plan; expired: no access; demo: explicitly granted temporary internal demo (reference private-demo-<employer-id>), not a payment';

CREATE TABLE IF NOT EXISTS internal_demo_grant_audit (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employer_id UUID NOT NULL REFERENCES employer_accounts(id),
  grant_reason TEXT NOT NULL,
  old_status TEXT NOT NULL,
  old_expires_at TIMESTAMPTZ NOT NULL,
  new_expires_at TIMESTAMPTZ NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
