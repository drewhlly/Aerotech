/**
 * Aerotech Global Payroll Compliance Foundation
 *
 * The important distinction:
 *
 * - The payroll ENGINE is generic.
 * - COUNTRY RULES are configuration.
 * - RULE VERSIONS are tied to effective dates.
 *
 * Never assume that one country's tax or pension formula applies
 * to another country.
 *
 * Before production payroll is enabled for a jurisdiction, its
 * statutory rules must be reviewed against authoritative sources.
 */

export type CountryCode =
  | "NG"
  | "GH"
  | "KE"
  | "ZA"
  | "GB"
  | "US";

export type StatutoryCategory =
  | "income_tax"
  | "pension"
  | "social_security"
  | "health"
  | "housing"
  | "other";

export interface StatutoryRule {
  id: string;
  country: CountryCode;
  name: string;
  category: StatutoryCategory;
  employeeRate?: number;
  employerRate?: number;
  employeeFixed?: number;
  employerFixed?: number;
  annualLimit?: number;
  monthlyLimit?: number;
  effectiveFrom: string;
  effectiveTo?: string;
  requiresAuthorityVerification: boolean;
  authority?: string;
  notes?: string;
}

export interface PayrollInput {
  country: CountryCode;
  payrollDate: string;
  grossPay: number;
  taxablePay: number;
  employeePensionablePay?: number;
  employeeId: string;
}

export interface PayrollDeduction {
  ruleId: string;
  name: string;
  category: StatutoryCategory;
  employeeAmount: number;
  employerAmount: number;
  taxable: boolean;
  sourceConfigured: boolean;
}

export interface PayrollResult {
  employeeId: string;
  country: CountryCode;
  payrollDate: string;
  grossPay: number;
  taxablePay: number;
  employeeDeductions: number;
  employerContributions: number;
  netPay: number;
  deductions: PayrollDeduction[];
  complianceStatus: "configured" | "requires_review";
  warnings: string[];
}

export const COUNTRY_METADATA: Record<
  CountryCode,
  {
    name: string;
    currency: string;
    taxLabel: string;
    pensionLabel: string;
    socialSecurityLabel: string;
  }
> = {
  NG: {
    name: "Nigeria",
    currency: "NGN",
    taxLabel: "PAYE / Personal Income Tax",
    pensionLabel: "Pension",
    socialSecurityLabel: "Statutory social contributions",
  },
  GH: {
    name: "Ghana",
    currency: "GHS",
    taxLabel: "Personal Income Tax",
    pensionLabel: "Pension",
    socialSecurityLabel: "SSNIT / social security",
  },
  KE: {
    name: "Kenya",
    currency: "KES",
    taxLabel: "PAYE",
    pensionLabel: "Retirement contribution",
    socialSecurityLabel: "Social security",
  },
  ZA: {
    name: "South Africa",
    currency: "ZAR",
    taxLabel: "PAYE",
    pensionLabel: "Retirement fund",
    socialSecurityLabel: "UIF",
  },
  GB: {
    name: "United Kingdom",
    currency: "GBP",
    taxLabel: "PAYE Income Tax",
    pensionLabel: "Workplace Pension",
    socialSecurityLabel: "National Insurance",
  },
  US: {
    name: "United States",
    currency: "USD",
    taxLabel: "Federal / State Income Tax",
    pensionLabel: "Retirement Plan",
    socialSecurityLabel: "Social Security / Medicare",
  },
};

/**
 * These rules are deliberately marked as requiring verification.
 *
 * This prevents Aerotech from presenting placeholder figures as
 * legally authoritative.
 *
 * Replace/add rules with verified country legislation and official
 * authority guidance before production use.
 */
export const STATUTORY_RULES: StatutoryRule[] = [
  {
    id: "NG-PAYE",
    country: "NG",
    name: "PAYE / Personal Income Tax",
    category: "income_tax",
    effectiveFrom: "2026-01-01",
    requiresAuthorityVerification: true,
    notes:
      "Progressive calculation should be implemented from the applicable Nigerian tax rules and employee reliefs.",
  },
  {
    id: "NG-PENSION",
    country: "NG",
    name: "Pension",
    category: "pension",
    effectiveFrom: "2026-01-01",
    requiresAuthorityVerification: true,
    notes:
      "Contribution calculation must use the applicable Nigerian pension framework and pensionable earnings definition.",
  },
  {
    id: "NG-OTHER",
    country: "NG",
    name: "Other statutory deductions",
    category: "other",
    effectiveFrom: "2026-01-01",
    requiresAuthorityVerification: true,
    notes:
      "Additional deductions/contributions should be configured according to employee and employer circumstances.",
  },

  {
    id: "GH-TAX",
    country: "GH",
    name: "Personal Income Tax",
    category: "income_tax",
    effectiveFrom: "2026-01-01",
    requiresAuthorityVerification: true,
  },
  {
    id: "GH-SSNIT",
    country: "GH",
    name: "SSNIT / Social Security",
    category: "social_security",
    effectiveFrom: "2026-01-01",
    requiresAuthorityVerification: true,
  },
  {
    id: "GH-PENSION",
    country: "GH",
    name: "Pension",
    category: "pension",
    effectiveFrom: "2026-01-01",
    requiresAuthorityVerification: true,
  },

  {
    id: "KE-PAYE",
    country: "KE",
    name: "PAYE",
    category: "income_tax",
    effectiveFrom: "2026-01-01",
    requiresAuthorityVerification: true,
  },
  {
    id: "KE-SOCIAL",
    country: "KE",
    name: "Social Security",
    category: "social_security",
    effectiveFrom: "2026-01-01",
    requiresAuthorityVerification: true,
  },
  {
    id: "KE-PENSION",
    country: "KE",
    name: "Retirement contribution",
    category: "pension",
    effectiveFrom: "2026-01-01",
    requiresAuthorityVerification: true,
  },

  {
    id: "ZA-PAYE",
    country: "ZA",
    name: "PAYE",
    category: "income_tax",
    effectiveFrom: "2026-01-01",
    requiresAuthorityVerification: true,
  },
  {
    id: "ZA-UIF",
    country: "ZA",
    name: "UIF",
    category: "social_security",
    effectiveFrom: "2026-01-01",
    requiresAuthorityVerification: true,
  },
  {
    id: "ZA-PENSION",
    country: "ZA",
    name: "Retirement fund",
    category: "pension",
    effectiveFrom: "2026-01-01",
    requiresAuthorityVerification: true,
  },

  {
    id: "GB-PAYE",
    country: "GB",
    name: "PAYE Income Tax",
    category: "income_tax",
    effectiveFrom: "2026-01-01",
    requiresAuthorityVerification: true,
  },
  {
    id: "GB-NI",
    country: "GB",
    name: "National Insurance",
    category: "social_security",
    effectiveFrom: "2026-01-01",
    requiresAuthorityVerification: true,
  },
  {
    id: "GB-PENSION",
    country: "GB",
    name: "Workplace Pension",
    category: "pension",
    effectiveFrom: "2026-01-01",
    requiresAuthorityVerification: true,
  },

  {
    id: "US-FEDERAL-TAX",
    country: "US",
    name: "Federal Income Tax",
    category: "income_tax",
    effectiveFrom: "2026-01-01",
    requiresAuthorityVerification: true,
  },
  {
    id: "US-FICA",
    country: "US",
    name: "Social Security / Medicare",
    category: "social_security",
    effectiveFrom: "2026-01-01",
    requiresAuthorityVerification: true,
  },
  {
    id: "US-RETIREMENT",
    country: "US",
    name: "Retirement Plan",
    category: "pension",
    effectiveFrom: "2026-01-01",
    requiresAuthorityVerification: true,
  },
];

export function getRulesForCountry(
  country: CountryCode,
  payrollDate: string
): StatutoryRule[] {
  return STATUTORY_RULES.filter((rule) => {
    if (rule.country !== country) return false;

    const effectiveFrom = rule.effectiveFrom <= payrollDate;
    const effectiveTo = rule.effectiveTo
      ? payrollDate <= rule.effectiveTo
      : true;

    return effectiveFrom && effectiveTo;
  });
}

export function calculatePayroll(
  input: PayrollInput
): PayrollResult {
  const rules = getRulesForCountry(input.country, input.payrollDate);

  const deductions: PayrollDeduction[] = [];
  const warnings: string[] = [];

  if (rules.length === 0) {
    warnings.push(
      `No payroll rules are configured for ${COUNTRY_METADATA[input.country].name}.`
    );
  }

  for (const rule of rules) {
    let employeeAmount = rule.employeeFixed ?? 0;
    let employerAmount = rule.employerFixed ?? 0;

    if (rule.employeeRate) {
      employeeAmount +=
        input.taxablePay * (rule.employeeRate / 100);
    }

    if (rule.employerRate) {
      employerAmount +=
        input.taxablePay * (rule.employerRate / 100);
    }

    deductions.push({
      ruleId: rule.id,
      name: rule.name,
      category: rule.category,
      employeeAmount,
      employerAmount,
      taxable: rule.category !== "income_tax",
      sourceConfigured: !rule.requiresAuthorityVerification,
    });

    if (rule.requiresAuthorityVerification) {
      warnings.push(
        `${rule.name} requires authoritative verification before production payroll use.`
      );
    }
  }

  const employeeDeductions = deductions.reduce(
    (sum, item) => sum + item.employeeAmount,
    0
  );

  const employerContributions = deductions.reduce(
    (sum, item) => sum + item.employerAmount,
    0
  );

  return {
    employeeId: input.employeeId,
    country: input.country,
    payrollDate: input.payrollDate,
    grossPay: input.grossPay,
    taxablePay: input.taxablePay,
    employeeDeductions,
    employerContributions,
    netPay: Math.max(0, input.grossPay - employeeDeductions),
    deductions,
    complianceStatus:
      warnings.length > 0 ? "requires_review" : "configured",
    warnings,
  };
}
