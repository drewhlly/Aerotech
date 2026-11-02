export type CommunicationRole = 'applicant' | 'employee' | 'employer';
export type Preferences = {job_alerts:boolean;newsletter:boolean;product_updates:boolean;company_ids:string[]};
export const defaultPreferences:Preferences={job_alerts:false,newsletter:false,product_updates:false,company_ids:[]};
export function parsePreferences(value:unknown,role:CommunicationRole):Preferences {
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid preferences.');
 const b=value as Record<string,unknown>;
 if(['job_alerts','newsletter','product_updates'].some(k=>typeof b[k]!=='boolean')||!Array.isArray(b.company_ids)||b.company_ids.length>50||b.company_ids.some(v=>typeof v!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)))throw Error('Choose valid email preferences and up to 50 companies.');
 return {job_alerts:role==='applicant'&&b.job_alerts===true,newsletter:b.newsletter===true,product_updates:b.product_updates===true,company_ids:role==='applicant'?[...new Set(b.company_ids as string[])]:[]};
}
export function parseAnnouncement(value:unknown,now=Date.now()) {
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid announcement.');
 const b=value as Record<string,unknown>;
 if(!['maintenance','upgrade','newsletter','experience'].includes(String(b.kind))||!['employer','applicant','employee','all'].includes(String(b.audience)))throw Error('Choose an announcement type and audience.');
 if(typeof b.title!=='string'||b.title.trim().length<5||b.title.length>160||/[\r\n]/.test(b.title)||typeof b.body!=='string'||b.body.trim().length<20||b.body.length>5000)throw Error('Add a title (5–160 characters) and message (20–5,000 characters).');
 const send=new Date(String(b.scheduled_for)).getTime(),start=b.starts_at?new Date(String(b.starts_at)).getTime():null;
 if(!Number.isFinite(send)||send<now-60000)throw Error('Choose a future send time.');
 const service=b.kind==='maintenance'||b.kind==='upgrade';
 if(service&&(b.audience!=='employer'||start===null||!Number.isFinite(start)||start<send+86400000))throw Error('Employer maintenance and upgrade notices must be scheduled at least 24 hours before the work starts.');
 return {kind:String(b.kind),audience:String(b.audience),title:b.title.trim(),body:b.body.trim(),scheduled_for:new Date(send).toISOString(),starts_at:service?new Date(start!).toISOString():null};
}
