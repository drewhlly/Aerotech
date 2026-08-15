/**
 * Aerotech Payroll Compliance Engine
 *
 * Country-aware statutory payroll architecture.
 *
 * This layer deliberately separates:
 *
 * 1. Employee compensation
 * 2. Employee statutory deductions
 * 3. Employer statutory contributions
 * 4. Country-specific authorities
 * 5. Effective dates / rule versions
 *
 * DO NOT treat the example rates below as legal advice or as a
 * production tax table. Production rules must be maintained from
 * authoritative country sources and versioned by effective date.
 */

export type PayrollJurisdiction =
  | "NG"
  | "GH"
  | "KE"
  | "ZA"
  | "GB"
  | "US"
  | "CA"
  | "OTHER";

export type StatutoryComponentType =
  | "income_tax"
  | "payee"
  | "pension"
  | "social_security"
  | "health_insurance"
  | "employment_insurance"
  | "other";

export interface StatutoryComponent {
  id: string;
  country: PayrollJurisdiction;
  type: StatutoryComponentType;
  name: string;
  authority: string;
  employeeRate?: number;
  employerRate?: number;
  employeeFixedAmount?: number;
  employerFixedAmount?: number;
  cap?: number;
  floor?: number;
  currency?: string;
  mandatory: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  sourceReference?: string;
  notes?: string;
}

export interface PayrollInput {
  country: PayrollJurisdiction;
  grossPay: number;
  taxablePay?: number;
  pensionablePay?: number;
  employeeReliefs?: number;
}

export interface PayrollLine {
  componentId: string;
  name: string;
  type: StatutoryComponentType;
  employeeAmount: number;
  employerAmount: number;
  authority: string;
  mandatory: boolean;
}

export interface PayrollCalculation {
  country: PayrollJurisdiction;
  grossPay: number;
  taxablePay: number;
  employeeDeductions: number;
  employerContributions: number;
  netPayBeforeOtherDeductions: number;
  lines: PayrollLine[];
  warnings: string[];
}

/**
 * Country configuration registry.
 *
 * Only architecture/configuration is supplied here.
 * Exact statutory rates must be populated and maintained using
 * authoritative jurisdiction sources before production payroll.
 */
export const statutoryComponents: StatutoryComponent[] = [
  {
    id: "NG-TAX",
    country: "NG",
    type: "income_tax",
    name: "Personal Income Tax / PAYE",
    authority: "Relevant Nigerian tax authority",
    mandatory: true,
    effectiveFrom: "2026-01-01",
    notes:
      "Configure current Nigerian PAYE bands, reliefs and filing rules from authoritative sources.",
  },

  {
    id: "NG-PENSION",
    country: "NG",
    type: "pension",
    name: "Contributory Pension",
    authority: "National Pension Commission / relevant PFA",
    employeeRate: 8,
    employerRate: 10,
    mandatory: true,
    effectiveFrom: "2026-01-01",
    notes:
      "Rates and pensionable earnings rules must be validated against current Nigerian requirements.",
  },

  {
    id: "NG-HEALTH",
    country: "NG",
    type: "health_insurance",
    name: "Health Insurance",
    authority: "Relevant Nigerian health insurance authority",
    mandatory: false,
    effectiveFrom: "2026-01-01",
    notes:
      "Configure applicable employee/employer obligations according to employee jurisdiction and scheme.",
  },

  {
    id: "GH-TAX",
    country: "GH",
    type: "income_tax",
    name: "PAYE",
    authority: "Ghana Revenue Authority",
    mandatory: true,
    effectiveFrom: "2026-01-01",
  },

  {
    id: "GH-PENSION",
    country: "GH",
    type: "pension",
    name: "Social Security and Pension",
    authority: "SSNIT / relevant pension authorities",
    mandatory: true,
    effectiveFrom: "2026-01-01",
  },

  {
    id: "KE-TAX",
    country: "KE",
    type: "income_tax",
    name: "PAYE",
    authority: "Kenya Revenue Authority",
    mandatory: true,
    effectiveFrom: "2026-01-01",
  },

  {
    id: "KE-SOCIAL",
    country: "KE",
    type: "social_security",
    name: "Social Security",
    authority: "Relevant Kenyan statutory authority",
    mandatory: true,
    effectiveFrom: "2026-01-01",
  },

  {
    id: "ZA-TAX",
    country: "ZA",
    type: "income_tax",
    name: "PAYE",
    authority: "South African Revenue Service",
    mandatory: true,
    effectiveFrom: "2026-01-01",
  },

  {
    id: "GB-TAX",
    country: "GB",
    type: "income_tax",
    name: "PAYE Income Tax",
    authority: "HM Revenue & Customs",
    mandatory: true,
    effectiveFrom: "2026-01-01",
  },

  {
    id: "GB-NI",
    country: "GB",
    type: "social_security",
    name: "National Insurance",
    authority: "HM Revenue & Customs",
    mandatory: true,
    effectiveFrom: "2026-01-01",
  },

  {
    id: "US-TAX",
    country: "US",
    type: "income_tax",
    name: "Federal Income Tax",
    authority: "Internal Revenue Service",
    mandatory: true,
    effectiveFrom: "2026-01-01",
  },

  {
    id: "US-SOCIAL",
    country: "US",
    type: "social_security",
    name: "Social Security / Medicare",
    authority: "Internal Revenue Service / Social Security Administration",
    mandatory: true,
    effectiveFrom: "2026-01-01",
  },

  {
    id: "CA-TAX",
    country: "CA",
    type: "income_tax",
    name: "Federal Income Tax",
    authority: "Canada Revenue Agency",
    mandatory: true,
    effectiveFrom: "2026-01-01",
  },
];

export function getCountryComponents(
  country: PayrollJurisdiction
): StatutoryComponent[] {
  return statutoryComponents.filter(
    (component) => component.country === country
  );
}

export function getMandatoryComponents(
  country: PayrollJurisdiction
): StatutoryComponent[] {
  return getCountryComponents(country).filter(
    (component) => component.mandatory
  );
}

export function calculateFlatStatutoryComponents(
  input: PayrollInput
): PayrollCalculation {
  const taxablePay = Math.max(
    0,
    input.taxablePay ?? input.grossPay - (input.employeeReliefs || 0)
  );

  const lines: PayrollLine[] = [];
  const warnings: string[] = [];

  const components = getMandatoryComponents(input.country);

  if (components.length === 0) {
    warnings.push(
      `No statutory configuration is currently active for ${input.country}.`
    );
  }

  for (const component of components) {
    let employeeAmount = 0;
    let employerAmount = 0;

    if (component.employeeRate !== undefined) {
      employeeAmount =
        taxablePay * (component.employeeRate / 100);
    }

    if (component.employeeFixedAmount !== undefined) {
      employeeAmount += component.employeeFixedAmount;
    }

    if (component.employerRate !== undefined) {
      const employerBase =
        input.pensionablePay ??
        input.taxablePay ??
        input.grossPay;

      employerAmount =
        employerBase * (component.employerRate / 100);
    }

    if (component.employerFixedAmount !== undefined) {
      employerAmount += component.employerFixedAmount;
    }

    if (component.cap !== undefined) {
      employeeAmount = Math.min(employeeAmount, component.cap);
      employerAmount = Math.min(employerAmount, component.cap);
    }

    lines.push({
      componentId: component.id,
      name: component.name,
      type: component.type,
      employeeAmount,
      employerAmount,
      authority: component.authority,
      mandatory: component.mandatory,
    });

    if (
      component.type === "income_tax" ||
      component.type === "payee"
    ) {
      warnings.push(
        `${component.name} requires the jurisdiction's progressive bands, reliefs and current filing rules before production use.`
      );
    }
  }

  const employeeDeductions = lines.reduce(
    (sum, line) => sum + line.employeeAmount,
    0
  );

  const employerContributions = lines.reduce(
    (sum, line) => sum + line.employerAmount,
    0
  );

  return {
    country: input.country,
    grossPay: input.grossPay,
    taxablePay,
    employeeDeductions,
    employerContributions,
    netPayBeforeOtherDeductions:
      input.grossPay - employeeDeductions,
    lines,
    warnings,
  };
}

export function validatePayrollConfiguration(
  country: PayrollJurisdiction
) {
  const components = getCountryComponents(country);

  return {
    country,
    configured: components.length > 0,
    componentCount: components.length,
    mandatoryCount: components.filter((item) => item.mandatory).length,
    needsProductionValidation: components.some(
      (item) =>
        !item.employeeRate &&
        !item.employerRate &&
        !item.employeeFixedAmount &&
        !item.employerFixedAmount
    ),
  };
}
