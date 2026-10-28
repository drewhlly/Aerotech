import {jobTypes} from './job-options.ts';
export * from './job-options.ts';
import {createHash} from 'node:crypto';
export class JobPolicyError extends Error {}
export class JobRateLimitError extends JobPolicyError {}
export function jobSlug(id:string,title:string){return title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,90)+'--'+id;}
export function jobId(slug:string){return slug.split('--').at(-1)||slug;}
export function screenJob(b:Record<string,unknown>){
 for(const k of ['title','department','location','country','employment_type','description'])if(typeof b[k]!=='string'||!String(b[k]).trim()||String(b[k]).length>20000)throw new JobPolicyError('Complete '+k.replaceAll('_',' '));
 if(!jobTypes.includes(b.employment_type as typeof jobTypes[number]))throw new JobPolicyError('Choose a supported job type');
 if(String(b.title).length<4||String(b.title).length>160||String(b.description).trim().length<80||String(b.requirements||'').trim().length<20)throw new JobPolicyError('Add a clear title, at least 80 characters of responsibilities and 20 characters of requirements');
 const content=[b.title,b.description,b.requirements].join(' ').normalize('NFKC');
 if(/(?:https?:\/\/|www\.|\b[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+?\d[\s().-]*){9,})/i.test(content))throw new JobPolicyError('Remove contact details and external links; applications stay in Aerotech');
 const screened=content.replace(/\b(?:no|zero)\s+(?:(?:application|registration|processing|recruitment|training)\s+)?fees?\b/gi,'');
 if(/(?:pay|send|deposit|transfer|purchase|non.?refundable).{0,45}(?:fee|money|registration|training|application)|(?:application|registration|processing|recruitment).{0,20}fee|guaranteed.{0,20}(?:income|returns)|get.rich.quick|crypto.{0,20}(?:investment|deposit)|money.launder/i.test(screened))throw new JobPolicyError('This posting contains prohibited fees or scam language. Applicants must never pay to apply');
 const days=Number(b.expiry_days??30);if(!Number.isInteger(days)||days<1||days>90)throw new JobPolicyError('Choose expiry between 1 and 90 days');
 const deadline=b.deadline?new Date(String(b.deadline)):null;if(deadline&&(!Number.isFinite(deadline.getTime())||deadline.getTime()<=Date.now()))throw new JobPolicyError('Deadline must be in the future');
 const min=b.salary_min===''||b.salary_min==null?null:Number(b.salary_min),max=b.salary_max===''||b.salary_max==null?null:Number(b.salary_max);
 if((min!==null&&(!Number.isFinite(min)||min<0))||(max!==null&&(!Number.isFinite(max)||max<0))||(min!==null&&max!==null&&min>max))throw new JobPolicyError('Enter a valid salary range');
 const currency=String(b.currency||'NGN');if(!['NGN','USD','GBP','EUR','GHS','KES','ZAR'].includes(currency))throw new JobPolicyError('Choose a supported currency');
 const fingerprint=createHash('sha256').update([b.title,b.location,b.description].map(v=>String(v).trim().toLowerCase().replace(/\s+/g,' ')).join('|')).digest('hex');
 return {fingerprint,days,deadline,min,max,currency,remote:b.remote===true};
}
