CREATE TABLE IF NOT EXISTS employer_sessions (
  token_hash TEXT PRIMARY KEY,
  employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS employer_sessions_employer_idx ON employer_sessions(employer_id);
