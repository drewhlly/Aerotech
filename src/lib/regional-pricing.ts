import {countryOptions} from './countries.ts';
import type {SubscriptionPlan} from './subscriptions.ts';
export type RegionalPrice={currency:string;amount:number|null;region:string};
const currencies:Record<string,string>={NG:'NGN',US:'USD',GB:'GBP',CA:'CAD',GH:'GHS',KE:'KES',ZA:'ZAR',IN:'INR',AE:'AED',AU:'AUD',NZ:'NZD',DE:'EUR',FR:'EUR',IE:'EUR',NL:'EUR',ES:'EUR',IT:'EUR',RW:'RWF',UG:'UGX',TZ:'TZS',EG:'EGP',CM:'XAF',SN:'XOF',CI:'XOF',ZM:'ZMW',ZW:'ZWG',PK:'PKR',BR:'BRL',JP:'JPY',CN:'CNY'};
export function normalizeCountry(value:string){const x=(value||'NG').trim();if(/^[A-Za-z]{2}$/.test(x))return x.toUpperCase();return countryOptions.find(option=>option.name.toLowerCase()===x.toLowerCase())?.code||x}
export function detectCountry(){if(typeof window==='undefined')return 'NG';try{return normalizeCountry(window.localStorage.getItem('aerotech_employer_country')||'NG')}catch{return 'NG'}}
export function regionalPrice(plan:SubscriptionPlan,country:string):RegionalPrice{const code=normalizeCountry(country),currency=currencies[code]||'';return {currency,amount:currency==='NGN'?plan.prices.NGN:null,region:countryOptions.find(option=>option.code===code)?.name||country}}
export function displayRegionalPrice(price:RegionalPrice){if(price.amount===null)return price.currency?price.currency+' pricing on request':'Regional pricing on request';return price.currency+' '+new Intl.NumberFormat(price.currency==='NGN'?'en-NG':'en-US',{maximumFractionDigits:0}).format(price.amount)}
