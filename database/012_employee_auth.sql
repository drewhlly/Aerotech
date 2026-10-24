CREATE TABLE IF NOT EXISTS employee_invitations (
 id UUID PRIMARY KEY, employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 employee_id UUID NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
 token_hash TEXT NOT NULL UNIQUE, expires_at TIMESTAMPTZ NOT NULL,
 accepted_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS employee_credentials (
 employee_id UUID PRIMARY KEY REFERENCES workforce_employees(id) ON DELETE CASCADE,
 employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 password_hash TEXT NOT NULL, activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS employee_sessions (
 token_hash TEXT PRIMARY KEY, employee_id UUID NOT NULL REFERENCES employee_credentials(employee_id) ON DELETE CASCADE,
 expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS employee_sessions_employee ON employee_sessions(employee_id);
