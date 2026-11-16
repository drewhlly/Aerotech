-- Demo access is not a Paystack payment and must never be represented as paid.
-- Existing active and expired subscriptions retain their current meaning.
ALTER TABLE company_subscriptions DROP CONSTRAINT IF EXISTS company_subscriptions_status_check;
ALTER TABLE company_subscriptions ADD CONSTRAINT company_subscriptions_status_check
  CHECK(status IN ('active','expired','demo'));
COMMENT ON COLUMN company_subscriptions.status IS
  'active: provider-verified paid plan; expired: no access; demo: explicitly granted temporary internal demo (reference private-demo-<employer-id>), not a payment';
