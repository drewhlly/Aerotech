import type {PoolClient} from 'pg';
export const salaryBands=['junior','mid','senior'] as const;
export function salaryBandInput(b:Record<string,unknown>){
 if(!salaryBands.includes(b.band as typeof salaryBands[number]))throw Error('Choose Junior, Mid or Senior');
 const values=['monthlyGross','basic','housing','transport'].map(k=>{const raw=String(b[k]??'');if(!/^\d+(\.\d{1,2})?$/.test(raw))throw Error('Enter valid band amounts');const n=Number(raw);if(n>1e10)throw Error('Amount exceeds supported range');return n});
 const [gross,basic,housing,transport]=values;
 if(gross<=0||basic+housing+transport<=0||basic+housing+transport>gross)throw Error('Pensionable components must be positive and cannot exceed gross salary');
 return {band:String(b.band),values};
}
// Called inside payroll preparation's employer lock. Existing runs are immutable snapshots.
export async function syncSalaryBands(c:PoolClient,employer:string){
 await c.query(`UPDATE payroll_employees p SET monthly_gross_ngn=b.monthly_gross,basic_salary_ngn=b.basic,housing_allowance_ngn=b.housing,transport_allowance_ngn=b.transport FROM salary_bands b WHERE p.employer_id=$1 AND b.employer_id=p.employer_id AND b.band=p.salary_band`,[employer]);
}
