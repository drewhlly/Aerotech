-- Restore the agreement fields retired by 037 without reviving old agreement text.
-- Existing acknowledgement snapshots and business records remain intact.
DO $$
DECLARE initialise_version boolean := NOT EXISTS (
 SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='company_workflow_settings' AND column_name='confidentiality_version'
);
BEGIN
 ALTER TABLE company_workflow_settings ADD COLUMN IF NOT EXISTS confidentiality_title TEXT NOT NULL DEFAULT 'Confidentiality acknowledgement';
 ALTER TABLE company_workflow_settings ADD COLUMN IF NOT EXISTS confidentiality_text TEXT NOT NULL DEFAULT '';
 ALTER TABLE company_workflow_settings ADD COLUMN IF NOT EXISTS confidentiality_version INTEGER NOT NULL DEFAULT 1;
 IF initialise_version THEN
  UPDATE company_workflow_settings s SET confidentiality_version=GREATEST(
   1,
   COALESCE((SELECT MAX(a.version)+1 FROM employee_agreement_acknowledgements a WHERE a.employer_id=s.employer_id),1),
   COALESCE((SELECT CASE WHEN r.payload->>'confidentiality_version' ~ '^[0-9]{1,8}$' THEN (r.payload->>'confidentiality_version')::integer+1 ELSE 1 END FROM retired_feature_archive r WHERE r.source_table='company_workflow_settings' AND r.source_key=s.employer_id::text),1)
  );
 END IF;
END $$;
CREATE INDEX IF NOT EXISTS confirmation_decision_employee_latest ON employee_confirmation_decisions(employer_id,employee_id,created_at DESC,id DESC);
CREATE INDEX IF NOT EXISTS onboarding_tasks_employee_status ON employee_onboarding_tasks(employer_id,employee_id,status);
