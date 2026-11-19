-- Migration 048 is immutable. Actual usage and admission reservations are distinct.
ALTER TABLE meetings ADD COLUMN mode TEXT NOT NULL DEFAULT 'built_in' CHECK(mode IN ('external_link','built_in'));
ALTER TABLE meetings ADD COLUMN external_url TEXT;
ALTER TABLE meetings ADD CONSTRAINT meeting_external_mode CHECK((mode='built_in' AND external_url IS NULL) OR (mode='external_link' AND external_url ~ '^https://[^[:space:]]+$'));
-- Existing ATS/recurrence writers default to built_in and are gated by server policy; new schedule forms default external_link.
ALTER TABLE meetings ALTER COLUMN type SET DEFAULT 'audio';
CREATE OR REPLACE VIEW meet_rooms AS SELECT * FROM meetings;
CREATE TABLE meeting_plan_limits (
 plan TEXT PRIMARY KEY CHECK(plan IN ('basic','professional','business','enterprise')),
 built_in_enabled BOOLEAN NOT NULL DEFAULT FALSE,
 monthly_minutes INTEGER NOT NULL CHECK(monthly_minutes>=0),
 max_participants INTEGER NOT NULL CHECK(max_participants BETWEEN 2 AND 100)
);
INSERT INTO meeting_plan_limits VALUES ('basic',FALSE,0,8),('professional',TRUE,500,8),('business',TRUE,2000,16),('enterprise',TRUE,5000,32);
CREATE TABLE employer_meeting_usage (
 employer_id UUID NOT NULL REFERENCES employer_accounts(id),month DATE NOT NULL,
 participant_minutes NUMERIC(14,4) NOT NULL DEFAULT 0 CHECK(participant_minutes>=0),
 audio_minutes NUMERIC(14,4) NOT NULL DEFAULT 0 CHECK(audio_minutes>=0 AND audio_minutes<=participant_minutes),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),PRIMARY KEY(employer_id,month)
);
CREATE TABLE employer_meeting_reservations (
 employer_id UUID NOT NULL REFERENCES employer_accounts(id),meeting_id UUID NOT NULL,generation INTEGER NOT NULL,month DATE NOT NULL,
 participant_minutes INTEGER NOT NULL CHECK(participant_minutes>0),released_at TIMESTAMPTZ,
 PRIMARY KEY(meeting_id,generation,month),FOREIGN KEY(employer_id,meeting_id) REFERENCES meetings(employer_id,id)
);
CREATE TABLE meeting_usage_segments (
 employer_id UUID NOT NULL,meeting_id UUID NOT NULL,generation INTEGER NOT NULL,
 provider_session_id TEXT NOT NULL,provider_participant_id TEXT NOT NULL,
 joined_at TIMESTAMPTZ NOT NULL,left_at TIMESTAMPTZ NOT NULL CHECK(left_at>=joined_at),audio_only BOOLEAN NOT NULL,
 PRIMARY KEY(provider_session_id,provider_participant_id),FOREIGN KEY(employer_id,meeting_id) REFERENCES meetings(employer_id,id)
);
ALTER TABLE meeting_provider_rooms ADD COLUMN usage_checked_at TIMESTAMPTZ;
ALTER TABLE meeting_provider_rooms ADD COLUMN usage_finalized_at TIMESTAMPTZ;
CREATE INDEX employer_meeting_reservations_tenant ON employer_meeting_reservations(employer_id,month) WHERE released_at IS NULL;
COMMENT ON TABLE employer_meeting_usage IS 'Actual provider-reported ended participant durations in UTC months; audio_minutes is a subset of participant_minutes. No client clock or media content.';

ALTER TABLE recruitment_interview_slots ADD COLUMN external_url TEXT;

ALTER TABLE meeting_provider_rooms ADD COLUMN type TEXT NOT NULL DEFAULT 'video' CHECK(type IN ('video','audio'));
UPDATE meeting_provider_rooms r SET type=m.type FROM meetings m WHERE m.id=r.meeting_id;
