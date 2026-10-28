CREATE TABLE IF NOT EXISTS support_enrollment_approvals (
 email TEXT PRIMARY KEY, account_type TEXT NOT NULL CHECK(account_type IN ('employer','applicant')),
 account_id UUID NOT NULL, approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), used_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS support_pending_enrollments (
 token_hash TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE REFERENCES support_enrollment_approvals(email),
 password_hash TEXT NOT NULL, totp_encrypted TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0,
 expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
