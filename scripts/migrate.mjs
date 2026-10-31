import pg from "pg";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query("BEGIN");
  const files = ["001_employer_accounts.sql", "002_employer_sessions.sql", "003_applicant_accounts.sql", "004_recruitment_payroll.sql", "005_payroll_approvals.sql", "006_nigeria_payroll.sql", "007_workforce_employees.sql", "008_hr_workflows.sql", "009_performance_surveys_attendance.sql", "010_attendance_verification.sql", "011_reporting_shifts_leave.sql", "012_employee_auth.sql", "013_tenant_integrity.sql", "014_employee_lifecycle.sql", "015_payroll_individual_approvals.sql", "016_payroll_transfers.sql", "017_employee_birthdays.sql", "018_aerotech_meet.sql", "019_payroll_employee_identity.sql", "021_support_console.sql", "022_support_enrollment.sql", "023_payroll_three_stage.sql", "024_recruitment_live.sql", "024_pulse_surveys.sql", "025_employee_profiles.sql", "026_camera_attendance.sql", "027_documents_confirmations.sql", "028_employee_engagement.sql", "029_payroll_workforce_link.sql", "030_portal_automation.sql", "031_payroll_payouts.sql", "032_salary_bands.sql", "033_workflow_automation.sql", "034_subscriptions_exits.sql", "035_profile_date_consistency.sql", "036_password_recovery.sql", "037_phase2_legacy_archive.sql", "037_phase2_jobs_privacy.sql", "037_collaboration.sql", "038_notification_lifecycle.sql", "039_guest_meetings.sql", "040_subscription_pricing.sql", "041_leave_types.sql"];
  // Existing deployments must explicitly adopt the ledger after checking their schema.
  const baseline = process.argv.find(v => v.startsWith('--baseline-through='))?.split('=')[1];
  if (baseline && !files.includes(baseline)) throw new Error('Unknown baseline migration');
  await client.query("SELECT pg_advisory_xact_lock(hashtext('aerotech-schema-migrations'))");
  const existing = (await client.query("SELECT to_regclass('public.employer_accounts') AS accounts,to_regclass('public.schema_migrations') AS ledger")).rows[0];
  if (existing.accounts && !existing.ledger && !baseline) throw new Error('Existing schema has no migration ledger. Verify its latest migration and use --baseline-through=FILE to adopt it without replaying historical SQL.');
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations(name TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), baselined BOOLEAN NOT NULL DEFAULT FALSE)');
  if (baseline && (await client.query('SELECT COUNT(*)::int AS n FROM schema_migrations')).rows[0].n) throw new Error('Baseline is only permitted for an empty migration ledger');
  for (const file of files) {
    const sql = readFileSync(new URL(`../database/${file}`, import.meta.url), "utf8");
    const checksum = createHash('sha256').update(sql).digest('hex');
    const applied = (await client.query('SELECT checksum FROM schema_migrations WHERE name=$1',[file])).rows[0];
    if (applied) { if (applied.checksum !== checksum) throw new Error('Applied migration changed: '+file); continue; }
    const baselined = Boolean(baseline && files.indexOf(file) <= files.indexOf(baseline));
    if (!baselined) await client.query(sql);
    await client.query('INSERT INTO schema_migrations(name,checksum,baselined) VALUES($1,$2,$3)',[file,checksum,baselined]);
    process.stdout.write(`${baselined ? "Baselined" : "Applied"} ${file}\n`);
  }
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally { await client.end(); }
