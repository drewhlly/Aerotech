-- Run once against Aerotech's PostgreSQL database before enabling signup.
CREATE TABLE IF NOT EXISTS employer_accounts (
  id UUID PRIMARY KEY,
  company_name TEXT NOT NULL,
  company_email TEXT NOT NULL UNIQUE,
  admin_first_name TEXT NOT NULL,
  admin_last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
