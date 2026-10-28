-- Additive Phase 2 migration. Never rewrites existing workforce/submission records.
CREATE TABLE IF NOT EXISTS collaboration_settings (
 employer_id UUID PRIMARY KEY REFERENCES employer_accounts(id), time_tracking BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE IF NOT EXISTS projects (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employer_id UUID NOT NULL REFERENCES employer_accounts(id),
 name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 200), description TEXT NOT NULL DEFAULT '', department TEXT, client TEXT,
 owner_employee_id UUID, starts_on DATE, ends_on DATE, status TEXT NOT NULL DEFAULT 'Planned' CHECK(status IN ('Planned','Active','On Hold','Completed','Cancelled')),
 priority TEXT NOT NULL DEFAULT 'Normal' CHECK(priority IN ('Low','Normal','High','Urgent')), tags TEXT[] NOT NULL DEFAULT '{}', budget NUMERIC(16,2) CHECK(budget>=0),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(employer_id,id),
 FOREIGN KEY(employer_id,owner_employee_id) REFERENCES workforce_employees(employer_id,id), CHECK(ends_on IS NULL OR starts_on IS NULL OR ends_on>=starts_on)
);
CREATE INDEX IF NOT EXISTS projects_tenant_date ON projects(employer_id,created_at DESC,id);
CREATE TABLE IF NOT EXISTS project_members (
 employer_id UUID NOT NULL, project_id UUID NOT NULL, employee_id UUID NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('Owner','Manager','Contributor','Viewer')), PRIMARY KEY(project_id,employee_id),
 FOREIGN KEY(employer_id,project_id) REFERENCES projects(employer_id,id) ON DELETE CASCADE,
 FOREIGN KEY(employer_id,employee_id) REFERENCES workforce_employees(employer_id,id)
);
CREATE INDEX IF NOT EXISTS project_members_access ON project_members(employer_id,employee_id,project_id);
CREATE TABLE IF NOT EXISTS project_tasks (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employer_id UUID NOT NULL, project_id UUID NOT NULL,
 title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 240), description TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'To Do' CHECK(status IN ('To Do','In Progress','Blocked','Done','Cancelled')),
 priority TEXT NOT NULL DEFAULT 'Normal' CHECK(priority IN ('Low','Normal','High','Urgent')), labels TEXT[] NOT NULL DEFAULT '{}', due_at TIMESTAMPTZ, starts_at TIMESTAMPTZ,
 estimate_minutes INTEGER CHECK(estimate_minutes>=0), parent_id UUID, recurrence_days INTEGER CHECK(recurrence_days BETWEEN 1 AND 365),
 created_by TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), revision INTEGER NOT NULL DEFAULT 1,
 UNIQUE(employer_id,project_id,id), UNIQUE(employer_id,id), FOREIGN KEY(employer_id,project_id) REFERENCES projects(employer_id,id) ON DELETE CASCADE,
 FOREIGN KEY(employer_id,project_id,parent_id) REFERENCES project_tasks(employer_id,project_id,id), CHECK(parent_id IS DISTINCT FROM id)
);
CREATE INDEX IF NOT EXISTS task_due_status ON project_tasks(employer_id,due_at,status);
CREATE INDEX IF NOT EXISTS task_project ON project_tasks(employer_id,project_id,created_at,id);
CREATE TABLE IF NOT EXISTS task_assignees (
 employer_id UUID NOT NULL, project_id UUID NOT NULL, task_id UUID NOT NULL, employee_id UUID NOT NULL,
 PRIMARY KEY(task_id,employee_id), FOREIGN KEY(employer_id,project_id,task_id) REFERENCES project_tasks(employer_id,project_id,id) ON DELETE CASCADE,
 FOREIGN KEY(project_id,employee_id) REFERENCES project_members(project_id,employee_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS task_assignee_person ON task_assignees(employer_id,employee_id,task_id);
CREATE TABLE IF NOT EXISTS task_dependencies (
 employer_id UUID NOT NULL, project_id UUID NOT NULL, task_id UUID NOT NULL, depends_on UUID NOT NULL,
 PRIMARY KEY(task_id,depends_on), CHECK(task_id<>depends_on),
 FOREIGN KEY(employer_id,project_id,task_id) REFERENCES project_tasks(employer_id,project_id,id) ON DELETE CASCADE,
 FOREIGN KEY(employer_id,project_id,depends_on) REFERENCES project_tasks(employer_id,project_id,id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS task_checklist (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employer_id UUID NOT NULL, task_id UUID NOT NULL, title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 240), done BOOLEAN NOT NULL DEFAULT FALSE,
 FOREIGN KEY(employer_id,task_id) REFERENCES project_tasks(employer_id,id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS task_comments (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employer_id UUID NOT NULL, task_id UUID NOT NULL, actor TEXT NOT NULL, body TEXT NOT NULL CHECK(length(body) BETWEEN 1 AND 4000), mentions UUID[] NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 FOREIGN KEY(employer_id,task_id) REFERENCES project_tasks(employer_id,id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS task_comments_page ON task_comments(employer_id,task_id,created_at,id);
CREATE TABLE IF NOT EXISTS project_milestones (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employer_id UUID NOT NULL, project_id UUID NOT NULL, title TEXT NOT NULL, due_on DATE NOT NULL, completed BOOLEAN NOT NULL DEFAULT FALSE,
 FOREIGN KEY(employer_id,project_id) REFERENCES projects(employer_id,id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS project_rules (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employer_id UUID NOT NULL, project_id UUID NOT NULL, trigger TEXT NOT NULL CHECK(trigger IN ('done','overdue','all_done')), enabled BOOLEAN NOT NULL DEFAULT TRUE,
 UNIQUE(project_id,trigger), FOREIGN KEY(employer_id,project_id) REFERENCES projects(employer_id,id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS task_time_entries (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employer_id UUID NOT NULL, task_id UUID NOT NULL, employee_id UUID NOT NULL, started_at TIMESTAMPTZ NOT NULL, ended_at TIMESTAMPTZ, minutes INTEGER CHECK(minutes>=0),
 FOREIGN KEY(employer_id,task_id) REFERENCES project_tasks(employer_id,id), FOREIGN KEY(employer_id,employee_id) REFERENCES workforce_employees(employer_id,id), CHECK(ended_at IS NULL OR ended_at>=started_at)
);
CREATE UNIQUE INDEX IF NOT EXISTS one_running_timer ON task_time_entries(employee_id) WHERE ended_at IS NULL;
CREATE TABLE IF NOT EXISTS collaboration_saved_views (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employer_id UUID NOT NULL REFERENCES employer_accounts(id), actor TEXT NOT NULL, name TEXT NOT NULL, filters JSONB NOT NULL DEFAULT '{}', UNIQUE(employer_id,actor,name)
);
ALTER TABLE meet_rooms ADD COLUMN IF NOT EXISTS agenda TEXT NOT NULL DEFAULT '';
ALTER TABLE meet_rooms ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Africa/Lagos';
ALTER TABLE meet_rooms ADD COLUMN IF NOT EXISTS recurrence TEXT NOT NULL DEFAULT 'none';
ALTER TABLE meet_rooms ADD COLUMN IF NOT EXISTS location TEXT NOT NULL DEFAULT '';
ALTER TABLE meet_rooms ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT '';
ALTER TABLE meet_rooms ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','cancelled','ended'));
ALTER TABLE meet_rooms ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;
ALTER TABLE meet_rooms ADD COLUMN IF NOT EXISTS join_generation INTEGER NOT NULL DEFAULT 1;
ALTER TABLE meet_participants ADD COLUMN IF NOT EXISTS required BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE meet_participants ADD COLUMN IF NOT EXISTS rsvp TEXT NOT NULL DEFAULT 'pending' CHECK(rsvp IN ('pending','Accept','Decline','Maybe'));
ALTER TABLE meet_participants ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS meeting_expiration ON meet_rooms(starts_at) WHERE status='scheduled';
CREATE TABLE IF NOT EXISTS meeting_invite_groups (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employer_id UUID NOT NULL REFERENCES employer_accounts(id), name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 120), members UUID[] NOT NULL DEFAULT '{}', UNIQUE(employer_id,id)
);
CREATE TABLE IF NOT EXISTS meeting_group_refs (
 employer_id UUID NOT NULL, room_id UUID NOT NULL, kind TEXT NOT NULL, value TEXT NOT NULL, required BOOLEAN NOT NULL DEFAULT TRUE, exclusions UUID[] NOT NULL DEFAULT '{}',
 PRIMARY KEY(room_id,kind,value), FOREIGN KEY(employer_id,room_id) REFERENCES meet_rooms(employer_id,id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS meeting_guests (
 employer_id UUID NOT NULL, room_id UUID NOT NULL, email TEXT NOT NULL, required BOOLEAN NOT NULL DEFAULT TRUE,
 PRIMARY KEY(room_id,email), FOREIGN KEY(employer_id,room_id) REFERENCES meet_rooms(employer_id,id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS meeting_actions (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employer_id UUID NOT NULL, room_id UUID NOT NULL, title TEXT NOT NULL, task_id UUID,
 FOREIGN KEY(employer_id,room_id) REFERENCES meet_rooms(employer_id,id), FOREIGN KEY(employer_id,task_id) REFERENCES project_tasks(employer_id,id)
);
CREATE TABLE IF NOT EXISTS document_folders (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employer_id UUID NOT NULL REFERENCES employer_accounts(id), name TEXT NOT NULL, parent_id UUID, UNIQUE(employer_id,id),
 FOREIGN KEY(employer_id,parent_id) REFERENCES document_folders(employer_id,id)
);
CREATE TABLE IF NOT EXISTS library_documents (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employer_id UUID NOT NULL REFERENCES employer_accounts(id), title TEXT NOT NULL, folder_id UUID,
 category TEXT NOT NULL CHECK(category IN ('Contracts','Policies','Payroll','Identification','Certificates','Company','Templates')),
 owner TEXT NOT NULL, employee_id UUID, department TEXT, tags TEXT[] NOT NULL DEFAULT '{}', expiry_date DATE, retention_until DATE,
 visibility TEXT NOT NULL DEFAULT 'private' CHECK(visibility IN ('private','people','department','company')), current_version INTEGER NOT NULL DEFAULT 1,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(employer_id,id),
 FOREIGN KEY(employer_id,folder_id) REFERENCES document_folders(employer_id,id), FOREIGN KEY(employer_id,employee_id) REFERENCES workforce_employees(employer_id,id)
);
CREATE INDEX IF NOT EXISTS library_document_scope ON library_documents(employer_id,visibility,department,created_at,id);
CREATE TABLE IF NOT EXISTS library_document_versions (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employer_id UUID NOT NULL, document_id UUID NOT NULL, version INTEGER NOT NULL, filename TEXT NOT NULL, mime TEXT NOT NULL,
 encrypted_content BYTEA NOT NULL, content_hash TEXT NOT NULL, size_bytes INTEGER NOT NULL CHECK(size_bytes BETWEEN 1 AND 2097152),
 scan_status TEXT NOT NULL DEFAULT 'pending' CHECK(scan_status IN ('pending','clean','infected')), created_by TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(document_id,version), FOREIGN KEY(employer_id,document_id) REFERENCES library_documents(employer_id,id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS document_grants (
 employer_id UUID NOT NULL, document_id UUID NOT NULL, employee_id UUID NOT NULL, PRIMARY KEY(document_id,employee_id),
 FOREIGN KEY(employer_id,document_id) REFERENCES library_documents(employer_id,id) ON DELETE CASCADE,
 FOREIGN KEY(employer_id,employee_id) REFERENCES workforce_employees(employer_id,id)
);
CREATE TABLE IF NOT EXISTS document_acknowledgements (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employer_id UUID NOT NULL, document_id UUID NOT NULL, version INTEGER NOT NULL, employee_id UUID NOT NULL,
 status TEXT NOT NULL DEFAULT 'Sent' CHECK(status IN ('Sent','Viewed','Signed','Declined')), content_hash TEXT NOT NULL, signed_name TEXT, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(document_id,version,employee_id), FOREIGN KEY(employer_id,document_id) REFERENCES library_documents(employer_id,id),
 FOREIGN KEY(document_id,version) REFERENCES library_document_versions(document_id,version), FOREIGN KEY(employer_id,employee_id) REFERENCES workforce_employees(employer_id,id)
);
CREATE TABLE IF NOT EXISTS task_attachments (
 employer_id UUID NOT NULL, task_id UUID NOT NULL, document_id UUID NOT NULL, PRIMARY KEY(task_id,document_id),
 FOREIGN KEY(employer_id,task_id) REFERENCES project_tasks(employer_id,id) ON DELETE CASCADE,
 FOREIGN KEY(employer_id,document_id) REFERENCES library_documents(employer_id,id)
);
CREATE TABLE IF NOT EXISTS document_templates (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employer_id UUID NOT NULL REFERENCES employer_accounts(id), title TEXT NOT NULL, body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS collaboration_audit (
 id BIGSERIAL PRIMARY KEY, employer_id UUID NOT NULL REFERENCES employer_accounts(id), actor TEXT NOT NULL, action TEXT NOT NULL, resource_id TEXT NOT NULL, details JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS collab_audit_tenant ON collaboration_audit(employer_id,created_at DESC,id);
CREATE TABLE IF NOT EXISTS notification_preferences (
 employer_id UUID NOT NULL REFERENCES employer_accounts(id), actor TEXT NOT NULL, event TEXT NOT NULL, in_app BOOLEAN NOT NULL DEFAULT TRUE, email BOOLEAN NOT NULL DEFAULT TRUE,
 digest TEXT NOT NULL DEFAULT 'none' CHECK(digest IN ('none','daily','weekly')), PRIMARY KEY(employer_id,actor,event)
);
CREATE TABLE IF NOT EXISTS collaboration_notifications (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employer_id UUID NOT NULL REFERENCES employer_accounts(id), actor TEXT NOT NULL, event TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL,
 href TEXT NOT NULL, source_key TEXT NOT NULL, read_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(employer_id,actor,source_key)
);
CREATE INDEX IF NOT EXISTS collab_notices_actor ON collaboration_notifications(employer_id,actor,created_at DESC,id);
CREATE TABLE IF NOT EXISTS collaboration_jobs (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employer_id UUID NOT NULL REFERENCES employer_accounts(id), kind TEXT NOT NULL, payload JSONB NOT NULL,
 dedupe_key TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','running','done','dead')), attempts INTEGER NOT NULL DEFAULT 0,
 run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), lease_until TIMESTAMPTZ, last_error TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(employer_id,dedupe_key)
);
CREATE INDEX IF NOT EXISTS collaboration_jobs_due ON collaboration_jobs(status,run_at) WHERE status IN ('pending','running');
ALTER TABLE ats_jobs ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS ats_jobs_expiry ON ats_jobs(expires_at) WHERE status='open';
CREATE INDEX IF NOT EXISTS meeting_participant_history ON meet_participants(employee_id,room_id);
ALTER TABLE collaboration_notifications ADD COLUMN IF NOT EXISTS in_app BOOLEAN NOT NULL DEFAULT TRUE;
