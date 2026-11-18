CREATE TABLE payroll_statutory_versions (
  jurisdiction text NOT NULL,
  effective_from date NOT NULL,
  rules jsonb NOT NULL,
  PRIMARY KEY (jurisdiction, effective_from)
);

-- Nigeria Tax Act 2025, ss. 30, 58 and Fourth Schedule:
-- https://nass.gov.ng/documents/download/11249
-- Pension Reform Act 2014, ss. 4, 11 and 120:
-- https://www.pencom.gov.ng/wp-content/uploads/2018/01/PRA_2014.pdf
-- Business Facilitation (Miscellaneous Provisions) Act 2022, Schedule para. 45:
-- https://admin.theiguides.org/Media/Documents/Business%20Facilitation%20Misc%20Provisions%20Act%202022.pdf
-- NSITF Employee Compensation Scheme: https://nsitf.gov.ng/services
INSERT INTO payroll_statutory_versions(jurisdiction, effective_from, rules)
VALUES ('NG', '2026-01-01', '{
  "bands":[[800000,0],[2200000,0.15],[9000000,0.18],[13000000,0.21],[25000000,0.23],[null,0.25]],
  "rentRate":0.20, "rentCap":500000, "employeePensionRate":0.08,
  "employerPensionRate":0.10, "pensionBase":"core_emoluments",
  "nhfRate":0.025, "nhfBase":"monthly_income",
  "nsitfRate":0.01, "nsitfBase":"total_monthly_payroll"
}');

ALTER TABLE payroll_employees ADD COLUMN rent_evidence_verified boolean NOT NULL DEFAULT false;
ALTER TABLE payroll_run_items ADD COLUMN statutory_breakdown jsonb;
ALTER TABLE payroll_runs ADD COLUMN statutory_effective_from date;
