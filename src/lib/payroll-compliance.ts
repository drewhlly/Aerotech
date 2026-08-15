/**
 * Aerotech Payroll Compliance Engine
 *
 * Country-aware payroll deductions and employer contributions.
 *
 * IMPORTANT:
 * Tax and statutory rules change frequently.
 * Each country configuration therefore has:
 * - country
 * - currency
 * - effectiveFrom
 * - effectiveTo
 * - tax authority
 * - pension/social contribution rules
 *
 * Never hard-code statutory deductions directly inside UI components.
 */

export type PayrollCountry =
  | "NG"
  | "GB"
  | "US"
  | "CA"
  | "ZA"
  | "GH"
  | "KE"
  | "AE";

export type DeductionType =
  | "PAYE"
  | "PENSION"
  | "SOCIAL_SECURITY"
  | "MEDICARE"
  | "NATIONAL_INSURANCE"
  | "UIF"
  | "SSNIT"
  | "NSSF"
  | "SHIF"
  | "OTHER";

export interface TaxBand {
  min: number;
  max?: number;
  rate: number;
}

export interface StatutoryContribution {
  name: string;
  type: DeductionType;

  /**
   * Employee contribution rate.
   */
  employeeRate: number;

  /**
   * Employer contribution rate.
   */
  employerRate: number;

  /**
   * What the percentage is calculated against.
   */
  basis:
    | "gross"
    | "basic"
    | "pensionable"
    | "monthly_emoluments"
    | "taxable_income";

  /**
   * Optional statutory cap.
   */
  annualCap?: number;

  /**
   * Whether this deduction is mandatory.
   */
  mandatory: boolean;
}

export interface CountryPayrollRule {
  country: PayrollCountry;
  countryName: string;
  currency: string;

  effectiveFrom: string;
  effectiveTo?: string;

  taxAuthority: string;

  payeeName: string;

  taxBands: TaxBand[];

  contributions: StatutoryContribution[];

  notes: string[];
}

/**
 * ---------------------------------------------------------
 * NIGERIA
 * ---------------------------------------------------------
 *
 * Current Nigeria PIT bands:
 *
 * First ₦800,000       0%
 * Next ₦2,200,000     15%
 * Next ₦9,000,000     18%
 * Next ₦13,000,000    21%
 * Next ₦25,000,000    23%
 * Above ₦50,000,000   25%
 *
 * Pension:
 * Employee: 8%
 * Employer: 10%
 *
 * Pension basis:
 * Monthly emoluments.
 */

export const NIGERIA_PAYROLL_RULE: CountryPayrollRule = {
  country: "NG",
  countryName: "Nigeria",
  currency: "NGN",

  effectiveFrom: "2026-01-01",

  taxAuthority: "Nigeria Revenue Service",

  payeeName: "State Internal Revenue Service / Nigeria Revenue Service",

  taxBands: [
    {
      min: 0,
      max: 800_000,
      rate: 0,
    },
    {
      min: 800_000,
      max: 3_000_000,
      rate: 0.15,
    },
    {
      min: 3_000_000,
      max: 12_000_000,
      rate: 0.18,
    },
    {
      min: 12_000_000,
      max: 25_000_000,
      rate: 0.21,
    },
    {
      min: 25_000_000,
      max: 50_000_000,
      rate: 0.23,
    },
    {
      min: 50_000_000,
      rate: 0.25,
    },
  ],

  contributions: [
    {
      name: "Employee Pension",
      type: "PENSION",
      employeeRate: 0.08,
      employerRate: 0,
      basis: "monthly_emoluments",
      mandatory: true,
    },

    {
      name: "Employer Pension",
      type: "PENSION",
      employeeRate: 0,
      employerRate: 0.10,
      basis: "monthly_emoluments",
      mandatory: true,
    },
  ],

  notes: [
    "PAYE is calculated using progressive personal income tax bands.",
    "Consolidated Relief Allowance is no longer used under the current regime.",
    "Eligible rent relief may apply subject to statutory limits and evidence.",
    "Pension contributions should be tracked separately from PAYE.",
    "Employer pension contributions are an employer cost and should not reduce employee net pay.",
  ],
};

/**
 * ---------------------------------------------------------
 * COUNTRY REGISTRY
 * ---------------------------------------------------------
 *
 * Additional countries can be added here as their statutory
 * rules are implemented and verified.
 *
 * We deliberately do NOT invent statutory rates for countries
 * whose current rules have not yet been configured.
 */

export const PAYROLL_RULES: Record<
  PayrollCountry,
  CountryPayrollRule | null
> = {
  NG: NIGERIA_PAYROLL_RULE,

  GB: null,
  US: null,
  CA: null,
  ZA: null,
  GH: null,
  KE: null,
  AE: null,
};

/**
 * ---------------------------------------------------------
 * PAYROLL INPUT
 * ---------------------------------------------------------
 */

export interface PayrollInput {
  country: PayrollCountry;

  /**
   * Monthly gross salary.
   */
  grossPay: number;

  /**
   * Monthly basic salary.
   */
  basicSalary?: number;

  /**
   * Housing allowance.
   */
  housingAllowance?: number;

  /**
   * Transport allowance.
   */
  transportAllowance?: number;

  /**
   * Other taxable allowances.
   */
  taxableAllowances?: number;

  /**
   * Employee pensionable emoluments.
   *
   * If supplied, this overrides automatic calculation.
   */
  pensionableEmoluments?: number;

  /**
   * Annual rent paid where applicable.
   */
  annualRent?: number;

  /**
   * Employee's voluntary pension contribution.
   */
  voluntaryPension?: number;
}

/**
 * ---------------------------------------------------------
 * PAYROLL RESULT
 * ---------------------------------------------------------
 */

export interface PayrollResult {
  country: PayrollCountry;

  grossPay: number;

  taxableAnnualIncome: number;

  annualPAYE: number;
  monthlyPAYE: number;

  employeePension: number;
  employerPension: number;

  totalEmployeeDeductions: number;

  netPay: number;

  employerStatutoryCost: number;

  /**
   * Useful for payslips and statutory reports.
   */
  deductions: {
    name: string;
    type: DeductionType;
    amount: number;
  }[];

  /**
   * Amounts that must be remitted to government/statutory bodies.
   */
  statutoryPayees: {
    payee: string;
    type: DeductionType;
    amount: number;
  }[];
}

/**
 * ---------------------------------------------------------
 * UTILITIES
 * ---------------------------------------------------------
 */

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Progressive tax calculator.
 */
export function calculateProgressiveTax(
  taxableIncome: number,
  bands: TaxBand[],
): number {
  if (taxableIncome <= 0) return 0;

  let tax = 0;

  for (const band of bands) {
    const lower = band.min;

    if (taxableIncome <= lower) {
      continue;
    }

    const upper = band.max ?? taxableIncome;

    const taxableInBand = Math.min(
      taxableIncome,
      upper,
    ) - lower;

    if (taxableInBand > 0) {
      tax += taxableInBand * band.rate;
    }

    if (band.max !== undefined && taxableIncome <= band.max) {
      break;
    }
  }

  return roundMoney(tax);
}

/**
 * ---------------------------------------------------------
 * NIGERIA PAYE
 * ---------------------------------------------------------
 *
 * Calculates annual PAYE and converts it to monthly PAYE.
 *
 * Rent relief:
 * 20% of annual rent, capped at ₦500,000.
 */

function calculateNigeriaPAYE(
  input: PayrollInput,
): {
  annualTax: number;
  taxableAnnualIncome: number;
} {
  const annualGross = input.grossPay * 12;

  const rentRelief = Math.min(
    Math.max((input.annualRent ?? 0) * 0.20, 0),
    500_000,
  );

  const pensionable =
    input.pensionableEmoluments ??
    (
      (input.basicSalary ?? 0) +
      (input.housingAllowance ?? 0) +
      (input.transportAllowance ?? 0)
    );

  /**
   * Employee pension is an allowable deduction
   * when determining taxable income under the applicable
   * statutory rules.
   */
  const annualEmployeePension =
    pensionable * 0.08 * 12;

  const annualTaxableIncome = Math.max(
    annualGross -
      annualEmployeePension -
      rentRelief,
    0,
  );

  const annualTax = calculateProgressiveTax(
    annualTaxableIncome,
    NIGERIA_PAYROLL_RULE.taxBands,
  );

  return {
    annualTax,
    taxableAnnualIncome: roundMoney(
      annualTaxableIncome,
    ),
  };
}

/**
 * ---------------------------------------------------------
 * MAIN CALCULATOR
 * ---------------------------------------------------------
 */

export function calculatePayroll(
  input: PayrollInput,
): PayrollResult {
  const rule = PAYROLL_RULES[input.country];

  if (!rule) {
    throw new Error(
      `Payroll compliance rules for ${input.country} have not yet been configured.`,
    );
  }

  if (input.grossPay < 0) {
    throw new Error("Gross pay cannot be negative.");
  }

  /**
   * Nigeria implementation.
   *
   * Other countries will use their own calculation
   * engines as they are activated.
   */
  if (input.country === "NG") {
    const pensionableEmoluments =
      input.pensionableEmoluments ??
      (
        (input.basicSalary ?? 0) +
        (input.housingAllowance ?? 0) +
        (input.transportAllowance ?? 0)
      );

    const employeePension =
      pensionableEmoluments * 0.08;

    const employerPension =
      pensionableEmoluments * 0.10;

    const paye = calculateNigeriaPAYE(input);

    const voluntaryPension =
      Math.max(input.voluntaryPension ?? 0, 0);

    const totalEmployeeDeductions =
      paye.annualTax / 12 +
      employeePension +
      voluntaryPension;

    const netPay =
      input.grossPay -
      totalEmployeeDeductions;

    return {
      country: "NG",

      grossPay: roundMoney(input.grossPay),

      taxableAnnualIncome:
        paye.taxableAnnualIncome,

      annualPAYE:
        roundMoney(paye.annualTax),

      monthlyPAYE:
        roundMoney(paye.annualTax / 12),

      employeePension:
        roundMoney(employeePension),

      employerPension:
        roundMoney(employerPension),

      totalEmployeeDeductions:
        roundMoney(totalEmployeeDeductions),

      netPay:
        roundMoney(netPay),

      employerStatutoryCost:
        roundMoney(employerPension),

      deductions: [
        {
          name: "PAYE",
          type: "PAYE",
          amount: roundMoney(
            paye.annualTax / 12,
          ),
        },

        {
          name: "Employee Pension",
          type: "PENSION",
          amount: roundMoney(
            employeePension,
          ),
        },

        ...(voluntaryPension > 0
          ? [
              {
                name: "Voluntary Pension",
                type: "PENSION" as DeductionType,
                amount: roundMoney(
                  voluntaryPension,
                ),
              },
            ]
          : []),
      ],

      statutoryPayees: [
        {
          payee: rule.payeeName,
          type: "PAYE",
          amount: roundMoney(
            paye.annualTax / 12,
          ),
        },

        {
          payee: "Pension Fund Custodian / PFA",
          type: "PENSION",
          amount: roundMoney(
            employeePension +
              employerPension,
          ),
        },
      ],
    };
  }

  throw new Error(
    `Calculation engine for ${input.country} is not active yet.`,
  );
}

/**
 * ---------------------------------------------------------
 * PAYROLL COMPLIANCE SUMMARY
 * ---------------------------------------------------------
 */

export function getPayrollCompliance(
  country: PayrollCountry,
) {
  const rule = PAYROLL_RULES[country];

  if (!rule) {
    return {
      configured: false,
      country,
      message:
        "Country payroll rules have not yet been configured.",
    };
  }

  return {
    configured: true,
    country: rule.country,
    countryName: rule.countryName,
    currency: rule.currency,
    effectiveFrom: rule.effectiveFrom,
    taxAuthority: rule.taxAuthority,
    contributions: rule.contributions,
    notes: rule.notes,
  };
}
