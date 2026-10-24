import pg from "pg";
import { readFileSync } from "node:fs";
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query("BEGIN");
  for (const file of ["001_employer_accounts.sql", "002_employer_sessions.sql", "003_applicant_accounts.sql", "004_recruitment_payroll.sql", "005_payroll_approvals.sql", "006_nigeria_payroll.sql", "007_workforce_employees.sql", "008_hr_workflows.sql", "009_performance_surveys_attendance.sql", "010_attendance_verification.sql", "011_reporting_shifts_leave.sql", "012_employee_auth.sql", "013_tenant_integrity.sql", "014_employee_lifecycle.sql", "015_payroll_individual_approvals.sql", "016_payroll_transfers.sql", "017_employee_birthdays.sql"]) {
    await client.query(readFileSync(new URL(`../database/${file}`, import.meta.url), "utf8"));
    process.stdout.write(`Applied ${file}\n`);
  }
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally { await client.end(); }
