import {EMPLOYER_PLANS,PRICING_VERSION,type EmployerPlan} from './subscriptions.ts';
import {regionalPrice,normalizeCountry} from './regional-pricing.ts';
export function quote(plan:string,country:string){
 if(!['basic','professional','business'].includes(plan))throw Error('Choose a published plan. Enterprise pricing requires a written quote.');
 const canonical=plan as EmployerPlan,c=normalizeCountry(country),price=regionalPrice(EMPLOYER_PLANS[canonical],c);
 if(price.amount===null)throw Error('Local pricing for this country requires a quote. Contact support.');
 return {...price,plan:canonical,country:c,amountMinor:Math.round(price.amount*100),pricingVersion:PRICING_VERSION,employeeLimit:EMPLOYER_PLANS[canonical].includedEmployees!};
}
