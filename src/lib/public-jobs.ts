import {cache} from 'react';
import {db} from './employer-session';
export type PublicJob={id:string;title:string;company_name:string;location:string;country:string;employment_type:string;description:string;requirements:string;created_at:string};
export const publicJobs=cache(async()=>{if(!process.env.DATABASE_URL)return {jobs:[] as PublicJob[],unavailable:true};const pool=db();try{const r=await pool.query<PublicJob>("SELECT j.id,j.title,j.location,j.country,j.employment_type,j.description,j.requirements,j.created_at,e.company_name FROM ats_jobs j JOIN employer_accounts e ON e.id=j.employer_id WHERE j.status='open' ORDER BY j.created_at DESC");return {jobs:r.rows,unavailable:false}}catch{return {jobs:[] as PublicJob[],unavailable:true}}finally{await pool.end()}});
