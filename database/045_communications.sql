-- Optional communications are opt-in. Existing accounts are not subscribed silently.
CREATE TABLE IF NOT EXISTS communication_preferences (
 role TEXT NOT NULL CHECK(role IN ('applicant','employee','employer')),
 account_id UUID NOT NULL,
 job_alerts BOOLEAN NOT NULL DEFAULT FALSE,
 newsletter BOOLEAN NOT NULL DEFAULT FALSE,
 product_updates BOOLEAN NOT NULL DEFAULT FALSE,
 company_ids UUID[] NOT NULL DEFAULT '{}',
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
 job_alerts_since TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 PRIMARY KEY(role,account_id)
);
CREATE TABLE IF NOT EXISTS platform_announcements (
 id UUID PRIMARY KEY,
 kind TEXT NOT NULL CHECK(kind IN ('maintenance','upgrade','newsletter','experience')),
 audience TEXT NOT NULL CHECK(audience IN ('employer','applicant','employee','all')),
 title TEXT NOT NULL,body TEXT NOT NULL,
 scheduled_for TIMESTAMPTZ NOT NULL,
 starts_at TIMESTAMPTZ,
 created_by UUID NOT NULL REFERENCES support_agents(id),
 cancelled_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CHECK(kind NOT IN ('maintenance','upgrade') OR (audience='employer' AND starts_at>=scheduled_for+INTERVAL '24 hours'))
);
CREATE TABLE IF NOT EXISTS communication_deliveries (
 id UUID PRIMARY KEY,role TEXT NOT NULL,account_id UUID NOT NULL,
 event_key TEXT NOT NULL,category TEXT NOT NULL CHECK(category IN ('job','newsletter','product','service')),
 job_id UUID REFERENCES ats_jobs(id) ON DELETE CASCADE,
 announcement_id UUID REFERENCES platform_announcements(id) ON DELETE CASCADE,
 subject TEXT NOT NULL,body TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sending','accepted','cancelled','failed')),
 attempts INTEGER NOT NULL DEFAULT 0,next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 provider_id TEXT,accepted_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(role,account_id,event_key)
);
CREATE INDEX IF NOT EXISTS communication_delivery_due ON communication_deliveries(next_attempt_at) WHERE status IN ('pending','sending');
