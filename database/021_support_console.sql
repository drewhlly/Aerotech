CREATE TABLE IF NOT EXISTS support_agents (
 id UUID PRIMARY KEY, email TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL,
 password_hash TEXT NOT NULL, totp_encrypted TEXT NOT NULL,
 last_totp_step BIGINT NOT NULL DEFAULT -1, disabled BOOLEAN NOT NULL DEFAULT FALSE,
 failed_attempts INTEGER NOT NULL DEFAULT 0, locked_until TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS support_sessions (
 token_hash TEXT PRIMARY KEY, agent_id UUID NOT NULL REFERENCES support_agents(id),
 expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS support_login_limits (
 email_hash TEXT PRIMARY KEY, attempts INTEGER NOT NULL DEFAULT 0, reset_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS support_auth_events (
 id UUID PRIMARY KEY, email_hash TEXT NOT NULL, agent_id UUID,
 outcome TEXT NOT NULL CHECK(outcome IN ('success','failure','throttled','logout')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS support_tickets (
 id UUID PRIMARY KEY, employer_id UUID NOT NULL REFERENCES employer_accounts(id),
 title TEXT NOT NULL CHECK(length(title) BETWEEN 3 AND 150),
 description TEXT NOT NULL CHECK(length(description) BETWEEN 3 AND 3000),
 status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','closed')),
 resolution TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), closed_at TIMESTAMPTZ,
 UNIQUE(employer_id,id)
);
CREATE TABLE IF NOT EXISTS support_grants (
 id UUID PRIMARY KEY, ticket_id UUID NOT NULL, employer_id UUID NOT NULL,
 scopes TEXT[] NOT NULL CHECK(cardinality(scopes)>0 AND scopes <@ ARRAY['workforce','recruitment','meetings','payroll']::text[]),
 approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), expires_at TIMESTAMPTZ NOT NULL,
 revoked_at TIMESTAMPTZ, CHECK(expires_at>approved_at AND expires_at<=approved_at+INTERVAL '1 hour'),
 FOREIGN KEY(employer_id,ticket_id) REFERENCES support_tickets(employer_id,id)
);
CREATE TABLE IF NOT EXISTS support_audit (
 id UUID PRIMARY KEY, employer_id UUID NOT NULL, ticket_id UUID NOT NULL,
 actor_type TEXT NOT NULL CHECK(actor_type IN ('company','support')),
 actor_id UUID NOT NULL, action TEXT NOT NULL, details JSONB NOT NULL DEFAULT '{}',
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 FOREIGN KEY(employer_id,ticket_id) REFERENCES support_tickets(employer_id,id)
);
CREATE INDEX IF NOT EXISTS support_tickets_company ON support_tickets(employer_id,created_at);
CREATE INDEX IF NOT EXISTS support_grants_ticket ON support_grants(ticket_id,approved_at);
CREATE INDEX IF NOT EXISTS support_audit_ticket ON support_audit(ticket_id,created_at);
CREATE OR REPLACE FUNCTION support_audit_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
 BEGIN RAISE EXCEPTION 'Support audit records are append-only'; END;
$$;
DROP TRIGGER IF EXISTS support_audit_no_edit ON support_audit;
CREATE TRIGGER support_audit_no_edit BEFORE UPDATE OR DELETE ON support_audit FOR EACH ROW EXECUTE FUNCTION support_audit_immutable();

DROP TRIGGER IF EXISTS support_auth_no_edit ON support_auth_events;
CREATE TRIGGER support_auth_no_edit BEFORE UPDATE OR DELETE ON support_auth_events FOR EACH ROW EXECUTE FUNCTION support_audit_immutable();
