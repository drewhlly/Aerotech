export type NigeriaRules = {
  bands: [number | null, number][];
  rentRate: number;
  rentCap: number;
  employeePensionRate: number;
  employerPensionRate: number;
  pensionBase: 'core_emoluments' | 'contractual_emoluments';
  nhfRate: number;
  nhfBase: 'monthly_income' | 'basic_salary';
  nsitfRate: number;
  nsitfBase: 'total_monthly_payroll';
};

export type PayrollInput = {
  monthlyGross: number;
  basic: number;
  housing: number;
  transport: number;
  contractualEmoluments?: number;
  annualRentRelief: number;
  rentEvidenceVerified?: boolean;
  pensionEnabled: boolean;
  nhfEnabled: boolean;
  taxExempt: boolean;
  sanctions: number;
  otherDeductions: number;
};

const money = (value: number) => Math.round(value * 100) / 100;

export function nigeriaPayroll(input: PayrollInput, rules: NigeriaRules) {
  const {monthlyGross, basic, housing, transport, annualRentRelief, rentEvidenceVerified,
    pensionEnabled, nhfEnabled, taxExempt, sanctions, otherDeductions} = input;
  const coreEmoluments = money(basic + housing + transport);
  const contractualEmoluments = input.contractualEmoluments ?? coreEmoluments;
  const amounts = [monthlyGross, basic, housing, transport, contractualEmoluments, annualRentRelief, sanctions, otherDeductions];
  if (amounts.some(value => !Number.isFinite(value) || value < 0) ||
      coreEmoluments > monthlyGross || contractualEmoluments > monthlyGross) {
    throw Error('Invalid compensation');
  }
  const pensionBase = rules.pensionBase === 'contractual_emoluments'
    ? Math.max(coreEmoluments, contractualEmoluments) : coreEmoluments;
  if (pensionEnabled && pensionBase === 0) throw Error('Basic, housing and transport required for pension');
  const employeePension = money(pensionEnabled ? pensionBase * rules.employeePensionRate : 0);
  const employerPension = money(pensionEnabled ? pensionBase * rules.employerPensionRate : 0);
  const nhfBase = rules.nhfBase === 'basic_salary' ? basic : monthlyGross;
  const nhf = money(nhfEnabled ? nhfBase * rules.nhfRate : 0);
  const rent = rentEvidenceVerified ? money(Math.min(annualRentRelief * rules.rentRate, rules.rentCap)) : 0;
  const grossAnnual = money(monthlyGross * 12);
  const reliefs = {pension: money(employeePension * 12), nhf: money(nhf * 12), rent};
  const annualTaxable = Math.max(0, money(grossAnnual - reliefs.pension - reliefs.nhf - reliefs.rent));

  let remaining = taxExempt ? 0 : annualTaxable;
  const bands = rules.bands.map(([width, rate]) => {
    const taxable = width === null ? remaining : Math.min(remaining, width);
    remaining = money(remaining - taxable);
    return {width, rate, taxable, tax: money(taxable * rate)};
  });
  const annualTax = money(bands.reduce((sum, band) => sum + band.tax, 0));
  const paye = money(annualTax / 12);
  const deductions = money(employeePension + nhf + paye + sanctions + otherDeductions);
  if (deductions > monthlyGross) throw Error('Deductions exceed monthly gross');
  return {
    gross: monthlyGross, paye, employeePension, employerPension, nhf, sanctions, otherDeductions,
    net: money(monthlyGross - deductions), deductions,
    statutoryBreakdown: {grossAnnual, reliefs, annualTaxable, taxExempt, bands, annualTax, paye,
      pensionBase, nhfBase, employerNsitf: money(monthlyGross * rules.nsitfRate)},
  };
}
