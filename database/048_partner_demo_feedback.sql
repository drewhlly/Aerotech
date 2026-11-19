-- Partner demo evaluations are separate from employer and applicant records.
CREATE TABLE IF NOT EXISTS partner_demo_feedback (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 partner_name VARCHAR(120) NOT NULL,
 partner_role VARCHAR(160) NOT NULL,
 evaluation_date DATE NOT NULL,
 portals TEXT[] NOT NULL,
 ratings JSONB NOT NULL,
 highlights TEXT NOT NULL,
 improvements TEXT NOT NULL,
 encountered_issue BOOLEAN NOT NULL,
 issue_description TEXT,
 issue_severity TEXT,
 completion TEXT NOT NULL,
 hr_fit SMALLINT NOT NULL CHECK(hr_fit BETWEEN 1 AND 5),
 competitiveness TEXT NOT NULL,
 commercial_readiness TEXT NOT NULL,
 priorities TEXT NOT NULL,
 recommendations TEXT[] NOT NULL,
 overall_rating SMALLINT NOT NULL CHECK(overall_rating BETWEEN 1 AND 10),
 additional_comments TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS partner_demo_feedback_created_at_idx ON partner_demo_feedback(created_at DESC);
-- Rollback: DROP TABLE partner_demo_feedback; (permanently deletes submitted evaluations).
