-- Enforce tenant ownership at the database boundary for new and existing HR records.
-- Validation blocks migration if cross-company references already exist.
CREATE UNIQUE INDEX IF NOT EXISTS workforce_employees_tenant_id ON workforce_employees(employer_id,id);
CREATE UNIQUE INDEX IF NOT EXISTS workforce_departments_tenant_id ON workforce_departments(employer_id,id);
CREATE UNIQUE INDEX IF NOT EXISTS attendance_sites_tenant_id ON attendance_sites(employer_id,id);
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='fk_employee_department_tenant') THEN
  ALTER TABLE workforce_employees ADD CONSTRAINT fk_employee_department_tenant FOREIGN KEY (employer_id,department_id) REFERENCES workforce_departments(employer_id,id);
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='fk_employee_manager_tenant') THEN
  ALTER TABLE workforce_employees ADD CONSTRAINT fk_employee_manager_tenant FOREIGN KEY (employer_id,manager_employee_id) REFERENCES workforce_employees(employer_id,id);
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='fk_department_manager_tenant') THEN
  ALTER TABLE workforce_departments ADD CONSTRAINT fk_department_manager_tenant FOREIGN KEY (employer_id,line_manager_employee_id) REFERENCES workforce_employees(employer_id,id);
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='fk_shift_employee_tenant') THEN
  ALTER TABLE workforce_shifts ADD CONSTRAINT fk_shift_employee_tenant FOREIGN KEY (employer_id,employee_id) REFERENCES workforce_employees(employer_id,id);
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='fk_shift_manager_tenant') THEN
  ALTER TABLE workforce_shifts ADD CONSTRAINT fk_shift_manager_tenant FOREIGN KEY (employer_id,assigned_by) REFERENCES workforce_employees(employer_id,id);
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='fk_request_employee_tenant') THEN
  ALTER TABLE employee_requests ADD CONSTRAINT fk_request_employee_tenant FOREIGN KEY (employer_id,employee_id) REFERENCES workforce_employees(employer_id,id);
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='fk_attendance_employee_tenant') THEN
  ALTER TABLE hr_attendance_events ADD CONSTRAINT fk_attendance_employee_tenant FOREIGN KEY (employer_id,employee_id) REFERENCES workforce_employees(employer_id,id);
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='fk_verification_employee_tenant') THEN
  ALTER TABLE attendance_verifications ADD CONSTRAINT fk_verification_employee_tenant FOREIGN KEY (employer_id,employee_id) REFERENCES workforce_employees(employer_id,id);
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='fk_verification_site_tenant') THEN
  ALTER TABLE attendance_verifications ADD CONSTRAINT fk_verification_site_tenant FOREIGN KEY (employer_id,site_id) REFERENCES attendance_sites(employer_id,id);
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='fk_credential_employee_tenant') THEN
  ALTER TABLE employee_credentials ADD CONSTRAINT fk_credential_employee_tenant FOREIGN KEY (employer_id,employee_id) REFERENCES workforce_employees(employer_id,id);
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='fk_invite_employee_tenant') THEN
  ALTER TABLE employee_invitations ADD CONSTRAINT fk_invite_employee_tenant FOREIGN KEY (employer_id,employee_id) REFERENCES workforce_employees(employer_id,id);
 END IF;
END $$;
