export function compensationInput(b:Record<string,unknown>){
 const out:Record<string,number|boolean>={};
 for(const key of ['monthlyGross','basic','housing','transport','annualRent','otherDeductions']){
  const raw=b[key];if(typeof raw!=='number'&&typeof raw!=='string')throw Error('Enter '+key);
  if(String(raw).trim()===''||!/^\d+(\.\d{1,2})?$/.test(String(raw)))throw Error('Use a non-negative amount with up to two decimal places');
  const value=Number(raw);if(!Number.isFinite(value)||value>1e10)throw Error('Amount is outside the supported range');out[key]=value;
 }
 if(!out.monthlyGross)throw Error('Monthly gross must be greater than zero');
 if(Number(out.basic)+Number(out.housing)+Number(out.transport)>Number(out.monthlyGross))throw Error('Basic, housing and transport cannot exceed monthly gross');
 if(Number(out.otherDeductions)>Number(out.monthlyGross))throw Error('Other deductions cannot exceed monthly gross');
 for(const key of ['pensionEnabled','nhfEnabled','taxExempt','active']){if(typeof b[key]!=='boolean')throw Error('Confirm payroll settings');out[key]=b[key] as boolean;}
 if(out.pensionEnabled&&Number(out.basic)+Number(out.housing)+Number(out.transport)===0)throw Error('Enter the pensionable basic, housing and transport amounts');
 return out;
}
