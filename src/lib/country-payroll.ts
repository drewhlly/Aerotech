import { nigeriaPayroll, type PayrollInput } from "@/lib/nigeria-payroll";
export type CountryPayroll = ReturnType<typeof nigeriaPayroll>;
export type PayrollJurisdiction = { countryCode: string; effectiveFrom: string; ready: boolean; description: string };
const registry: Record<string, PayrollJurisdiction> = {
 NG: {countryCode:"NG",effectiveFrom:"2026-01-01",ready:true,description:"Nigeria 2026 PAYE/pension/NHF preview"},
 US: {countryCode:"US",effectiveFrom:"",ready:false,description:"Federal and state withholding needs verified local configuration"},
 GB: {countryCode:"GB",effectiveFrom:"",ready:false,description:"PAYE, NI and pension rules need verified configuration"},
 GH: {countryCode:"GH",effectiveFrom:"",ready:false,description:"GRA tax and SSNIT rules need verified configuration"},
 KE: {countryCode:"KE",effectiveFrom:"",ready:false,description:"PAYE, pension, housing levy and SHIF need verified configuration"},
};
export function payrollJurisdiction(country: string): PayrollJurisdiction {
 const code=country.trim().toUpperCase();
 return registry[code] ?? {countryCode:code, effectiveFrom:"",ready:false,description:"Local payroll regulations require legal and tax verification"};
}
export function calculatePayrollForCountry(country:string, input:PayrollInput):CountryPayroll {
 const jurisdiction=payrollJurisdiction(country);
 if(!jurisdiction.ready)throw new Error(`Payroll calculations are not enabled for ${jurisdiction.countryCode || "this country"} until local statutory rules are verified.`);
 if(jurisdiction.countryCode==="NG")return nigeriaPayroll(input);
 throw new Error("Country payroll calculation unavailable");
}
