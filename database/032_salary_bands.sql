CREATE TABLE IF NOT EXISTS salary_bands (
 employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 band TEXT NOT NULL CHECK(band IN ('junior','mid','senior')),
 monthly_gross NUMERIC(15,2) NOT NULL CHECK(monthly_gross>0),
 basic NUMERIC(15,2) NOT NULL CHECK(basic>=0),
 housing NUMERIC(15,2) NOT NULL CHECK(housing>=0),
 transport NUMERIC(15,2) NOT NULL CHECK(transport>=0),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 PRIMARY KEY(employer_id,band),
 CHECK(basic+housing+transport<=monthly_gross),
 CHECK(basic+housing+transport>0)
);
ALTER TABLE payroll_employees ADD COLUMN IF NOT EXISTS salary_band TEXT CHECK(salary_band IN ('junior','mid','senior'));
