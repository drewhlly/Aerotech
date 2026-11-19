-- Preserve existing URLs, interview foreign keys and worker queries through an updatable view.
ALTER TABLE meet_rooms RENAME TO meetings;
ALTER TABLE meetings ADD COLUMN host_id UUID REFERENCES employer_accounts(id);
UPDATE meetings SET host_id=employer_id;
ALTER TABLE meetings ALTER COLUMN host_id SET NOT NULL;
ALTER TABLE meetings ADD COLUMN type TEXT NOT NULL DEFAULT 'video' CHECK(type IN ('video','audio'));
ALTER TABLE meetings ADD COLUMN provider TEXT NOT NULL DEFAULT 'daily' CHECK(provider='daily');
ALTER TABLE meetings ADD COLUMN provider_room_name TEXT;
ALTER TABLE meetings ADD COLUMN provider_generation INTEGER;
CREATE VIEW meet_rooms AS SELECT * FROM meetings;
-- An email invite may be unclaimed until its owner signs into an Aerotech applicant account.
CREATE TABLE meeting_participants (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
 employer_id UUID NOT NULL,
 user_id UUID,
 principal_type TEXT NOT NULL CHECK(principal_type IN ('employer','employee','applicant','email')),
 role TEXT NOT NULL DEFAULT 'participant' CHECK(role IN ('host','participant')),
 invited_email TEXT,
 invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 joined_at TIMESTAMPTZ,
 status TEXT NOT NULL DEFAULT 'invited' CHECK(status IN ('invited','waiting','admitted','rejected','joined','left')),
 admitted_generation INTEGER,
 FOREIGN KEY(employer_id,meeting_id) REFERENCES meetings(employer_id,id) ON DELETE CASCADE,
 CHECK((principal_type='email' AND user_id IS NULL AND invited_email IS NOT NULL) OR (principal_type<>'email' AND user_id IS NOT NULL))
);
CREATE UNIQUE INDEX meeting_participant_identity ON meeting_participants(meeting_id,principal_type,user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX meeting_participant_email ON meeting_participants(meeting_id,lower(invited_email)) WHERE invited_email IS NOT NULL;
INSERT INTO meeting_participants(meeting_id,employer_id,user_id,principal_type,role,status)
 SELECT id,employer_id,employer_id,'employer','host','admitted' FROM meetings;
INSERT INTO meeting_participants(meeting_id,employer_id,user_id,principal_type,joined_at)
 SELECT room_id,employer_id,employee_id,'employee',joined_at FROM meet_participants;
INSERT INTO meeting_participants(meeting_id,employer_id,user_id,principal_type)
 SELECT DISTINCT m.id,m.employer_id,a.applicant_id,'applicant' FROM ats_applications a JOIN meetings m ON m.id=a.interview_room_id ON CONFLICT DO NOTHING;
INSERT INTO meeting_participants(meeting_id,employer_id,invited_email,principal_type)
 SELECT room_id,employer_id,email,'email' FROM meeting_guests ON CONFLICT DO NOTHING;
CREATE INDEX meeting_participant_user ON meeting_participants(principal_type,user_id,meeting_id);
CREATE TABLE meeting_usage_reservations (
 meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
 generation INTEGER NOT NULL,
 month DATE NOT NULL,
 participant_minutes INTEGER NOT NULL CHECK(participant_minutes>0),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 PRIMARY KEY(meeting_id,generation,month)
);
COMMENT ON TABLE meeting_usage_reservations IS 'Conservative admission budget, not provider billing; never release reservations early or assume it includes calls outside Aerotech.';
-- Compatibility writers (ATS/recurrence) retain their routes and populate identities.
CREATE FUNCTION meeting_default_host() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.host_id=COALESCE(NEW.host_id,NEW.employer_id); RETURN NEW; END $$;
CREATE TRIGGER meeting_default_host BEFORE INSERT ON meetings FOR EACH ROW EXECUTE FUNCTION meeting_default_host();
CREATE FUNCTION meeting_host_identity() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO meeting_participants(meeting_id,employer_id,user_id,principal_type,role,status) VALUES(NEW.id,NEW.employer_id,NEW.host_id,'employer','host','admitted'); RETURN NEW; END $$;
CREATE TRIGGER meeting_host_identity AFTER INSERT ON meetings FOR EACH ROW EXECUTE FUNCTION meeting_host_identity();
CREATE FUNCTION meeting_employee_identity() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO meeting_participants(meeting_id,employer_id,user_id,principal_type) VALUES(NEW.room_id,NEW.employer_id,NEW.employee_id,'employee') ON CONFLICT DO NOTHING; RETURN NEW; END $$;
CREATE TRIGGER meeting_employee_identity AFTER INSERT ON meet_participants FOR EACH ROW EXECUTE FUNCTION meeting_employee_identity();
CREATE FUNCTION meeting_applicant_identity() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.interview_room_id IS NOT NULL AND NEW.interview_room_id IS DISTINCT FROM OLD.interview_room_id THEN INSERT INTO meeting_participants(meeting_id,employer_id,user_id,principal_type) SELECT m.id,m.employer_id,NEW.applicant_id,'applicant' FROM meetings m JOIN ats_jobs j ON j.id=NEW.job_id AND j.employer_id=m.employer_id WHERE m.id=NEW.interview_room_id ON CONFLICT DO NOTHING; END IF; RETURN NEW; END $$;
CREATE TRIGGER meeting_applicant_identity AFTER UPDATE OF interview_room_id ON ats_applications FOR EACH ROW EXECUTE FUNCTION meeting_applicant_identity();
CREATE FUNCTION meeting_email_identity() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO meeting_participants(meeting_id,employer_id,invited_email,principal_type) VALUES(NEW.room_id,NEW.employer_id,lower(NEW.email),'email') ON CONFLICT DO NOTHING; RETURN NEW; END $$;
CREATE TRIGGER meeting_email_identity AFTER INSERT ON meeting_guests FOR EACH ROW EXECUTE FUNCTION meeting_email_identity();
CREATE TABLE meeting_provider_rooms(
 meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,generation INTEGER NOT NULL,
 room_name TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),PRIMARY KEY(meeting_id,generation)
);
CREATE FUNCTION meeting_invitation_job() RETURNS trigger LANGUAGE plpgsql AS $$ DECLARE g INTEGER; BEGIN SELECT join_generation INTO g FROM meetings WHERE id=NEW.meeting_id; INSERT INTO collaboration_jobs(employer_id,kind,dedupe_key,payload) VALUES(NEW.employer_id,'meeting_delivery','meeting-invite:'||NEW.id||':'||g,jsonb_build_object('meeting',NEW.meeting_id,'participant',NEW.id,'generation',g,'event','invite')) ON CONFLICT DO NOTHING; RETURN NEW; END $$;
CREATE TRIGGER meeting_invitation_job AFTER INSERT ON meeting_participants FOR EACH ROW EXECUTE FUNCTION meeting_invitation_job();
