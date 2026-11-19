-- Opt-in biometric migration. Run only on a PostgreSQL branch with pgvector available.
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE face_enrollments (
 employee_id UUID PRIMARY KEY REFERENCES workforce_employees(id) ON DELETE CASCADE,
 employer_id UUID NOT NULL,
 consent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),consent_version TEXT NOT NULL,
 state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','active')),
 approved_by TEXT,approved_at TIMESTAMPTZ,
 FOREIGN KEY(employer_id,employee_id) REFERENCES workforce_employees(employer_id,id) ON DELETE CASCADE
);
CREATE TABLE face_templates (
 id UUID PRIMARY KEY,employee_id UUID NOT NULL REFERENCES face_enrollments(employee_id) ON DELETE CASCADE,
 employer_id UUID NOT NULL,embedding vector(128) NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),is_active BOOLEAN NOT NULL DEFAULT FALSE,
 FOREIGN KEY(employer_id,employee_id) REFERENCES workforce_employees(employer_id,id) ON DELETE CASCADE
);
CREATE INDEX face_templates_employee ON face_templates(employer_id,employee_id) WHERE is_active;
CREATE FUNCTION enforce_face_template_limit() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 PERFORM 1 FROM face_enrollments WHERE employee_id=NEW.employee_id FOR UPDATE;
 IF (SELECT count(*) FROM face_templates WHERE employee_id=NEW.employee_id)>=5 THEN RAISE EXCEPTION 'Face template limit reached'; END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER face_template_limit BEFORE INSERT ON face_templates FOR EACH ROW EXECUTE FUNCTION enforce_face_template_limit();
CREATE TABLE face_challenges (
 id UUID PRIMARY KEY,employee_id UUID NOT NULL,employer_id UUID NOT NULL,session_hash TEXT NOT NULL,
 purpose TEXT NOT NULL CHECK(purpose IN ('enroll','clock_in','clock_out')),action TEXT NOT NULL CHECK(action IN ('blink','left','right','smile')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),expires_at TIMESTAMPTZ NOT NULL,consumed_at TIMESTAMPTZ,match_distance DOUBLE PRECISION,
 FOREIGN KEY(employer_id,employee_id) REFERENCES workforce_employees(employer_id,id) ON DELETE CASCADE
);
CREATE INDEX face_challenge_employee ON face_challenges(employer_id,employee_id,created_at);
CREATE TABLE face_attempt_limits (
 employee_id UUID PRIMARY KEY REFERENCES workforce_employees(id) ON DELETE CASCADE,
 window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),issued INTEGER NOT NULL DEFAULT 0,failures INTEGER NOT NULL DEFAULT 0,locked_until TIMESTAMPTZ
);
ALTER TABLE hr_attendance_events ADD COLUMN IF NOT EXISTS method TEXT CHECK(method IN ('face','manual'));
ALTER TABLE hr_attendance_events ADD COLUMN IF NOT EXISTS match_distance DOUBLE PRECISION;
ALTER TABLE hr_attendance_events ADD COLUMN IF NOT EXISTS liveness_passed BOOLEAN;
ALTER TABLE hr_attendance_events ADD COLUMN IF NOT EXISTS device_info JSONB;
ALTER TABLE hr_attendance_events ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE hr_attendance_events ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE hr_attendance_events ADD COLUMN IF NOT EXISTS status TEXT CHECK(status IN ('verified','needs_review'));
-- Pending requests are excluded from payroll events until a manager approves them.
CREATE TABLE face_attendance_requests (
 id UUID PRIMARY KEY,employer_id UUID NOT NULL,employee_id UUID NOT NULL,work_date DATE NOT NULL,
 event_type TEXT NOT NULL CHECK(event_type IN ('clock_in','clock_out')),event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 method TEXT NOT NULL CHECK(method IN ('face','manual')),match_distance DOUBLE PRECISION,liveness_passed BOOLEAN NOT NULL DEFAULT FALSE,
 liveness_source TEXT NOT NULL DEFAULT 'not_performed',device_info JSONB NOT NULL DEFAULT '{}',latitude DOUBLE PRECISION,longitude DOUBLE PRECISION,
 status TEXT NOT NULL DEFAULT 'needs_review' CHECK(status IN ('needs_review','approved','rejected')),reason TEXT NOT NULL,
 reviewed_by TEXT,reviewed_at TIMESTAMPTZ,review_note TEXT,attendance_event_id UUID REFERENCES hr_attendance_events(id),
 FOREIGN KEY(employer_id,employee_id) REFERENCES workforce_employees(employer_id,id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX face_attendance_pending ON face_attendance_requests(employee_id,work_date,event_type) WHERE status='needs_review';
CREATE INDEX face_review_queue ON face_attendance_requests(employer_id,status,event_time);
CREATE TABLE face_attendance_audit (
 id UUID PRIMARY KEY,employer_id UUID NOT NULL,employee_id UUID NOT NULL,actor TEXT NOT NULL,action TEXT NOT NULL,
 request_id UUID,reason TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 FOREIGN KEY(employer_id,employee_id) REFERENCES workforce_employees(employer_id,id) ON DELETE CASCADE
);
COMMENT ON TABLE face_templates IS 'Sensitive biometric descriptors: no face images; never return embeddings through APIs.';
COMMENT ON COLUMN face_attendance_requests.liveness_passed IS 'Browser challenge consistency only. Not server-attested liveness; browser_unattested always requires manager review.';
