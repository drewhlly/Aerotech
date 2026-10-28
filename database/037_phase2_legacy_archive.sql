-- Preserve retired feature values before removing the old guards and columns.
-- This archive is not exposed by application APIs or used for access decisions.
CREATE TABLE IF NOT EXISTS retired_feature_archive (
 source_table TEXT NOT NULL, source_key TEXT NOT NULL, payload JSONB NOT NULL,
 archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY(source_table,source_key)
);
INSERT INTO retired_feature_archive(source_table,source_key,payload)
 SELECT 'ats_jobs',id::text,jsonb_strip_nulls(jsonb_build_object(
 'approval_status',to_jsonb(j)->'approval_status','approval_note',to_jsonb(j)->'approval_note',
 'approved_at',to_jsonb(j)->'approved_at','approved_by',to_jsonb(j)->'approved_by'))
 FROM ats_jobs j WHERE to_jsonb(j) ?| ARRAY['approval_status','approval_note','approved_at','approved_by']
 ON CONFLICT DO NOTHING;
INSERT INTO retired_feature_archive(source_table,source_key,payload)
 SELECT 'company_workflow_settings',employer_id::text,jsonb_strip_nulls(jsonb_build_object(
 'vacancy_approver_employee_id',to_jsonb(s)->'vacancy_approver_employee_id',
 'confidentiality_title',to_jsonb(s)->'confidentiality_title','confidentiality_text',to_jsonb(s)->'confidentiality_text',
 'confidentiality_version',to_jsonb(s)->'confidentiality_version'))
 FROM company_workflow_settings s WHERE to_jsonb(s) ?| ARRAY['vacancy_approver_employee_id','confidentiality_title','confidentiality_text','confidentiality_version']
 ON CONFLICT DO NOTHING;
INSERT INTO retired_feature_archive(source_table,source_key,payload)
 SELECT 'employee_notifications',id::text,to_jsonb(n) FROM employee_notifications n WHERE source_key='onboarding-start'
 ON CONFLICT DO NOTHING;
INSERT INTO retired_feature_archive(source_table,source_key,payload)
 SELECT 'employee_onboarding_tasks',id::text,to_jsonb(t) FROM employee_onboarding_tasks t WHERE title='Review company confidentiality agreement'
 ON CONFLICT DO NOTHING;
