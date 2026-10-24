export type EmployerPlan = "basic" | "professional" | "business" | "enterprise";
export type AccountType = "employer" | "employee";
export type Currency = "NGN" | "USD";

export type SubscriptionPlan = {
  id: string;
  name: string;
  accountType: AccountType;
  monthly: boolean; // false means billed annually for paid employer plans

  // Default display values used by the current pricing UI.
  // NGN is the default currency for now.
  price: string;
  period: string;
  description: string;

  // International pricing.
  prices: {
    NGN: number;
    USD: number;
  };

  features: string[];
};

export type Subscription = {
  accountType: AccountType;
  employerPlan?: EmployerPlan;
  planId: string;
  currency: Currency;
  status: "pending" | "active" | "expired" | "cancelled";
  startedAt?: string;
  expiresAt?: string;
};

export const EMPLOYER_PLANS: Record<
  EmployerPlan,
  SubscriptionPlan
> = {
  basic: {
    id: "employer_basic",
    name: "Basic",
    accountType: "employer",
    monthly: false,
    price: "₦500,000",
    period: "/ year",
    description:
      "Essential recruitment tools for growing businesses.",
    prices: {
      NGN: 500000,
      USD: 350,
    },
    features: [
      "Recruitment dashboard",
      "Job posting",
      "Candidate management",
      "Basic AI recruitment assistance",
      "Candidate matching",
      "Basic recruitment analytics",
      "Standard support",
    ],
  },

  professional: {
    id: "employer_professional",
    name: "Professional",
    accountType: "employer",
    monthly: false,
    price: "₦1,000,000",
    period: "/ year",
    description:
      "Advanced recruitment capabilities for growing teams.",
    prices: {
      NGN: 1000000,
      USD: 700,
    },
    features: [
      "Everything in Basic",
      "Advanced candidate matching",
      "Advanced AI recruitment assistance",
      "Advanced recruitment analytics",
      "Candidate pipeline automation",
      "Team collaboration",
      "Priority support",
    ],
  },

  business: {
    id: "employer_business",
    name: "Business",
    accountType: "employer",
    monthly: false,
    price: "₦2,000,000",
    period: "/ year",
    description:
      "Enterprise recruitment intelligence and automation.",
    prices: {
      NGN: 2000000,
      USD: 1400,
    },
    features: [
      "Everything in Professional",
      "Unlimited recruitment workflows",
      "Advanced AI automation",
      "AI candidate screening",
      "Workforce intelligence",
      "Premium analytics and reporting",
      "Unlimited team collaboration",
      "Priority enterprise support",
    ],
  },
  enterprise: {
    id: "employer_enterprise",
    name: "Enterprise",
    accountType: "employer",
    monthly: false,
    price: "Contact sales",
    period: "custom annual pricing",
    description: "Tailored workforce automation, implementation and support for large organisations.",
    prices: { NGN: 0, USD: 0 },
    features: [
      "Everything in Business",
      "Custom integrations and workflows",
      "Dedicated implementation support",
      "Organisation-specific automation",
      "Advanced reporting and controls",
      "Enterprise account management",
    ],
  },

};

export const EMPLOYEE_PLAN: SubscriptionPlan = {
  id: "employee_access",
  name: "Employee Access",
  accountType: "employee",
  monthly: false,
  price: "Free",
  period: "employer-sponsored",
  description:
    "Free access for employees sponsored by their employer.",
  prices: {
    NGN: 0,
    USD: 0,
  },
  features: [
    "Employee profile",
    "Job discovery",
    "AI-assisted job matching",
    "Application management",
    "Candidate profile visibility",
    "Career tools",
    "Employee dashboard",
  ],
};

export function getEmployerPlan(
  plan: EmployerPlan
): SubscriptionPlan {
  return EMPLOYER_PLANS[plan];
}

export function getPlanPrice(
  plan: SubscriptionPlan,
  currency: Currency
): number {
  return plan.prices[currency];
}

export function formatPrice(
  amount: number,
  currency: Currency
): string {
  if (currency === "NGN") {
    return `₦${amount.toLocaleString("en-NG")}`;
  }

  return `USD ${amount.toLocaleString("en-US")}`;
}

export function getAllEmployerPlans(): SubscriptionPlan[] {
  return Object.values(EMPLOYER_PLANS);
}
