ALTER TABLE workflow_alerts ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE employee_notifications ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE collaboration_notifications ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS workflow_alerts_active ON workflow_alerts(employer_id,created_at DESC) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS employee_notifications_active ON employee_notifications(employer_id,employee_id,created_at DESC) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS collaboration_notifications_active ON collaboration_notifications(employer_id,actor,created_at DESC) WHERE read_at IS NULL AND in_app;
UPDATE workflow_alerts SET expires_at=((right(alert_key,10)::date+1)::timestamp AT TIME ZONE 'Africa/Lagos') WHERE expires_at IS NULL AND alert_key ~ '^birthday:.*:[0-9]{4}-[0-9]{2}-[0-9]{2}$';
UPDATE employee_notifications SET expires_at=(((created_at AT TIME ZONE 'Africa/Lagos')::date+1)::timestamp AT TIME ZONE 'Africa/Lagos') WHERE expires_at IS NULL AND title ILIKE '%birthday%';
UPDATE collaboration_notifications SET expires_at=(((created_at AT TIME ZONE 'Africa/Lagos')::date+1)::timestamp AT TIME ZONE 'Africa/Lagos') WHERE expires_at IS NULL AND title ILIKE '%birthday%';
