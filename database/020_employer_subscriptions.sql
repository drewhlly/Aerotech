CREATE TABLE IF NOT EXISTS employer_subscription_payments (
 reference TEXT PRIMARY KEY, employer_id UUID NOT NULL REFERENCES employer_accounts(id),
 plan TEXT NOT NULL, amount BIGINT NOT NULL CHECK(amount > 0), currency TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), paid_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS employer_subscriptions (
 employer_id UUID PRIMARY KEY REFERENCES employer_accounts(id), plan TEXT NOT NULL,
 expires_at TIMESTAMPTZ NOT NULL, payment_reference TEXT NOT NULL REFERENCES employer_subscription_payments(reference)
);
