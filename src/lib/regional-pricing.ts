import type { Currency, SubscriptionPlan } from "@/lib/subscriptions";

export type RegionalPrice = { currency: string; amount: number | null; region: string };

const supported: Record<string, Currency> = { NG: "NGN", US: "USD" };
const labels: Record<string, string> = {
  GB: "United Kingdom", CA: "Canada", GH: "Ghana", KE: "Kenya",
  ZA: "South Africa", IN: "India", AE: "United Arab Emirates",
  NG: "Nigeria", US: "United States",
};

export function detectCountry(): string {
  if (typeof window === "undefined") return "NG";
  const saved = window.localStorage.getItem("aerotech_employer_country");
  const alias: Record<string, string> = { nigeria:"NG", "united states":"US", usa:"US", "united kingdom":"GB", ghana:"GH", kenya:"KE", canada:"CA", "south africa":"ZA", india:"IN" };
  if (saved) {
    const normalized = saved.trim().toLowerCase();
    if (alias[normalized]) return alias[normalized];
    if (/^[a-z]{2}$/.test(normalized)) return normalized.toUpperCase();
  }
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const language of languages) {
    try {
      const region = new Intl.Locale(language).region;
      if (region) return region.toUpperCase();
    } catch { /* ignore invalid browser locale */ }
  }
  // Unknown country: do not assume a currency or silently show Nigerian prices.
  return "UNKNOWN";
}

export function regionalPrice(plan: SubscriptionPlan, country: string): RegionalPrice {
  const currency = supported[country];
  return { currency: currency ?? "", amount: currency ? plan.prices[currency] : null, region: labels[country] || country };
}

export function displayRegionalPrice(price: RegionalPrice): string {
  if (price.amount === null) return "Regional pricing on request";
  return `${price.currency} ${new Intl.NumberFormat(price.currency === "NGN" ? "en-NG" : "en-US", { maximumFractionDigits: 0 }).format(price.amount)}`;
}
