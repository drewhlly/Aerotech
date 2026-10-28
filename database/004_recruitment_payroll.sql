CREATE TABLE IF NOT EXISTS imported_candidates (
 id UUID PRIMARY KEY,
 employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 full_name TEXT NOT NULL,
 email TEXT NOT NULL,
 phone TEXT,
 position_applied TEXT,
 source_file TEXT,
 imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(employer_id,email)
);
CREATE TABLE IF NOT EXISTS payroll_employees (
 id UUID PRIMARY KEY,
 employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 full_name TEXT NOT NULL,
 monthly_gross_ngn NUMERIC(15,2) NOT NULL CHECK(monthly_gross_ngn>=0),
 employee_pension_rate NUMERIC(5,4) NOT NULL DEFAULT 0,
 other_deductions_ngn NUMERIC(15,2) NOT NULL DEFAULT 0,
 active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS payroll_runs (
 id UUID PRIMARY KEY,
 employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 payroll_month DATE NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending_ceo_approval' CHECK(status IN ('pending_ceo_approval','approved','rejected')),
 gross_total NUMERIC(15,2) NOT NULL,
 deduction_total NUMERIC(15,2) NOT NULL,
 net_total NUMERIC(15,2) NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 approved_at TIMESTAMPTZ,
 UNIQUE(employer_id,payroll_month)
);
CREATE TABLE IF NOT EXISTS payroll_run_items (
 id UUID PRIMARY KEY,
 run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
 employee_id UUID NOT NULL REFERENCES payroll_employees(id),
 gross NUMERIC(15,2) NOT NULL,
 pension NUMERIC(15,2) NOT NULL,
 other_deductions NUMERIC(15,2) NOT NULL,
 net NUMERIC(15,2) NOT NULL
);
