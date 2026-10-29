-- Existing paid contracts and previously issued orders retain their original terms.
ALTER TABLE company_payment_orders ADD COLUMN IF NOT EXISTS pricing_version TEXT NOT NULL DEFAULT 'legacy';
ALTER TABLE company_payment_orders ADD COLUMN IF NOT EXISTS employee_limit INTEGER CHECK(employee_limit>0);
ALTER TABLE company_subscriptions ADD COLUMN IF NOT EXISTS pricing_version TEXT NOT NULL DEFAULT 'legacy';
ALTER TABLE company_subscriptions ADD COLUMN IF NOT EXISTS employee_limit INTEGER CHECK(employee_limit>0);
ALTER TABLE company_subscriptions ADD COLUMN IF NOT EXISTS capacity_enforced_from TIMESTAMPTZ;
