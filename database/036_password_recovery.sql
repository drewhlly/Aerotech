CREATE TABLE IF NOT EXISTS account_password_resets (
 token_hash TEXT PRIMARY KEY,
 account_role TEXT NOT NULL CHECK(account_role IN ('employer','employee','applicant')),
 account_id UUID NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 expires_at TIMESTAMPTZ NOT NULL,
 used_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS account_password_resets_account_time ON account_password_resets(account_role,account_id,created_at);
