CREATE TABLE IF NOT EXISTS attendance_sites (
 id UUID PRIMARY KEY,employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 name TEXT NOT NULL,latitude DOUBLE PRECISION NOT NULL CHECK(latitude BETWEEN -90 AND 90),
 longitude DOUBLE PRECISION NOT NULL CHECK(longitude BETWEEN -180 AND 180),
 radius_m INTEGER NOT NULL DEFAULT 150 CHECK(radius_m BETWEEN 30 AND 5000),
 active BOOLEAN NOT NULL DEFAULT TRUE,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS attendance_verifications (
 id UUID PRIMARY KEY,employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 employee_id UUID NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
 site_id UUID REFERENCES attendance_sites(id),event_type TEXT NOT NULL CHECK(event_type IN ('clock_in','clock_out')),
 latitude DOUBLE PRECISION,longitude DOUBLE PRECISION,accuracy_m DOUBLE PRECISION,
 distance_m DOUBLE PRECISION,verification_method TEXT NOT NULL CHECK(verification_method IN ('gps','remote_approved','biometric')),
 biometric_status TEXT NOT NULL DEFAULT 'not_used' CHECK(biometric_status IN ('not_used','verified','failed')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS attendance_sites_employer ON attendance_sites(employer_id);
