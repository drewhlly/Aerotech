export type PayrollStatus =
  | "draft"
  | "processing"
  | "pending_approval"
  | "approved"
  | "paid";

export type PayrollCurrency = "NGN" | "USD" | "GBP" | "EUR";

export type PayFrequency =
  | "monthly"
  | "biweekly"
  | "weekly";

export type PayrollEmployee = {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  role: string;
  currency: PayrollCurrency;
  payFrequency: PayFrequency;

  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  overtime: number;
  bonus: number;

  tax: number;
  pension: number;
  loanDeduction: number;
  otherDeductions: number;

  status: "active" | "inactive";
};

export type PayrollRun = {
  id: string;
  period: string;
  currency: PayrollCurrency;
  employeeCount: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: PayrollStatus;
  createdAt: string;
};

export const PAYROLL_EMPLOYEES: PayrollEmployee[] = [
  {
    id: "EMP-001",
    name: "Adebayo Williams",
    employeeId: "AER-001",
    department: "Human Resources",
    role: "HR Administrator",
    currency: "NGN",
    payFrequency: "monthly",
    basicSalary: 450000,
    housingAllowance: 100000,
    transportAllowance: 75000,
    otherAllowances: 25000,
    overtime: 0,
    bonus: 50000,
    tax: 72000,
    pension: 45000,
    loanDeduction: 0,
    otherDeductions: 5000,
    status: "active",
  },
  {
    id: "EMP-002",
    name: "Sarah Johnson",
    employeeId: "AER-002",
    department: "Finance",
    role: "Accountant",
    currency: "NGN",
    payFrequency: "monthly",
    basicSalary: 550000,
    housingAllowance: 120000,
    transportAllowance: 80000,
    otherAllowances: 30000,
    overtime: 25000,
    bonus: 0,
    tax: 89000,
    pension: 55000,
    loanDeduction: 20000,
    otherDeductions: 5000,
    status: "active",
  },
  {
    id: "EMP-003",
    name: "David Okafor",
    employeeId: "AER-003",
    department: "Technology",
    role: "Software Engineer",
    currency: "NGN",
    payFrequency: "monthly",
    basicSalary: 750000,
    housingAllowance: 150000,
    transportAllowance: 100000,
    otherAllowances: 50000,
    overtime: 35000,
    bonus: 100000,
    tax: 135000,
    pension: 75000,
    loanDeduction: 0,
    otherDeductions: 10000,
    status: "active",
  },
  {
    id: "EMP-004",
    name: "Michael Brown",
    employeeId: "AER-004",
    department: "Operations",
    role: "Operations Manager",
    currency: "USD",
    payFrequency: "monthly",
    basicSalary: 4500,
    housingAllowance: 800,
    transportAllowance: 400,
    otherAllowances: 200,
    overtime: 150,
    bonus: 500,
    tax: 900,
    pension: 450,
    loanDeduction: 0,
    otherDeductions: 50,
    status: "active",
  },
];

export const PAYROLL_RUNS: PayrollRun[] = [
  {
    id: "PAY-2026-08",
    period: "August 2026",
    currency: "NGN",
    employeeCount: 3,
    grossPay: 2940000,
    deductions: 519000,
    netPay: 2421000,
    status: "pending_approval",
    createdAt: "2026-08-10",
  },
  {
    id: "PAY-2026-07",
    period: "July 2026",
    currency: "NGN",
    employeeCount: 3,
    grossPay: 2740000,
    deductions: 485000,
    netPay: 2255000,
    status: "paid",
    createdAt: "2026-07-31",
  },
];

export function calculateGrossPay(employee: PayrollEmployee) {
  return (
    employee.basicSalary +
    employee.housingAllowance +
    employee.transportAllowance +
    employee.otherAllowances +
    employee.overtime +
    employee.bonus
  );
}

export function calculateDeductions(employee: PayrollEmployee) {
  return (
    employee.tax +
    employee.pension +
    employee.loanDeduction +
    employee.otherDeductions
  );
}

export function calculateNetPay(employee: PayrollEmployee) {
  return calculateGrossPay(employee) - calculateDeductions(employee);
}

export function formatPayrollAmount(
  amount: number,
  currency: PayrollCurrency
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  }).format(amount);
}
