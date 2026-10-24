// Nigerian payroll preview rules for periods beginning 2026-01.
// Verify benefits, eligibility and relief evidence before final authorization.
export type PayrollInput = {
 monthlyGross:number; basic:number; housing:number; transport:number;
 annualRentRelief:number; // annual rent actually paid; claim limited to 20% or NGN 500,000
 pensionEnabled:boolean; nhfEnabled:boolean;
 taxExempt:boolean; sanctions:number; otherDeductions:number;
};
const money=(v:number)=>Math.round(v*100)/100;
export function nigeriaPayroll(input:PayrollInput) {
 const {monthlyGross,basic,housing,transport,annualRentRelief,pensionEnabled,nhfEnabled,taxExempt,sanctions,otherDeductions}=input;
 const vals=[monthlyGross,basic,housing,transport,annualRentRelief,sanctions,otherDeductions];
 if(vals.some(v=>!Number.isFinite(v)||v<0)||basic+housing+transport>monthlyGross)throw Error("Invalid compensation");
 const pensionBase=basic+housing+transport;
 if(pensionEnabled&&pensionBase===0)throw Error("Basic, housing and transport required for pension");
 const employeePension=money(pensionEnabled?pensionBase*.08:0);
 const employerPension=money(pensionEnabled?pensionBase*.10:0);
 const nhf=money(nhfEnabled?basic*.025:0);
 const annualTaxable=Math.max(0,monthlyGross*12-employeePension*12-nhf*12-Math.min(annualRentRelief*0.20,500000));
 const bands:[[number,number],...[number,number][]]=[[800000,0],[2200000,.15],[9000000,.18],[13000000,.21],[25000000,.23],[Infinity,.25]];
 let remaining=annualTaxable,annualTax=0;
 for(const [size,rate] of bands){const slice=Math.min(remaining,size);annualTax+=slice*rate;remaining-=slice;if(remaining<=0)break;}
 const paye=taxExempt||monthlyGross<=70000?0:money(annualTax/12);
 const deductions=money(employeePension+nhf+paye+sanctions+otherDeductions);
 if(deductions>monthlyGross)throw Error("Deductions exceed monthly gross");
 return {gross:monthlyGross,paye,employeePension,employerPension,nhf,sanctions,otherDeductions,net:money(monthlyGross-deductions),deductions};
}
