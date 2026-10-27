import {cache} from 'react';
import {db} from './employer-session';import {jobId} from './job-policy';
export async function searchJobs(params:Record<string,string|undefined>={}){
 const p=db();const values:unknown[]=[];const where=["j.status='published'","j.expires_at>NOW()","(j.deadline IS NULL OR j.deadline>NOW())"];
 for(const [param,column] of [['q','j.title'],['location','j.location'],['type','j.employment_type'],['department','j.department']] as const)if(params[param]){values.push('%'+params[param]!.slice(0,120)+'%');where.push(`${column} ILIKE $${values.length}`)}
 if(params.remote==='true')where.push('j.remote=TRUE');if(params.salary&&Number.isFinite(Number(params.salary))){values.push(Number(params.salary));where.push(`j.salary_max>=$${values.length}`)}
 if(params.id){values.push(jobId(params.id));where.push(`j.id::text=$${values.length}`)}
 const page=Math.max(1,Math.min(10000,parseInt(params.page||'1')||1));
 try{const count=await p.query(`SELECT COUNT(*)::int AS n FROM ats_jobs j WHERE ${where.join(' AND ')}`,values);const r=await p.query(`SELECT j.id,j.title,j.description,j.requirements,j.department,j.location,j.country,j.employment_type,j.remote,j.salary_min,j.salary_max,j.currency,j.published_at,j.expires_at,j.deadline,e.company_name,(e.email_verified_at IS NOT NULL AND e.company_verified_at IS NOT NULL) AS verified FROM ats_jobs j JOIN employer_accounts e ON e.id=j.employer_id WHERE ${where.join(' AND ')} ORDER BY j.published_at DESC,j.id LIMIT 12 OFFSET ${(page-1)*12}`,values);return {jobs:r.rows,total:count.rows[0].n,page,unavailable:false}}catch{return {jobs:[],total:0,page,unavailable:true}}finally{await p.end()}
}

export const findPublicJob=cache(async(id:string)=>(await searchJobs({id})).jobs[0]);
