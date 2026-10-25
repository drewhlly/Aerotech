import RecruitmentWorkspace from '@/components/recruitment-workspace';
import {notFound} from 'next/navigation';
import {db} from '@/lib/employer-session';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!/^[0-9a-f-]{36}$/i.test(id))notFound();const pool=db();let job;try{job=(await pool.query("SELECT id FROM ats_jobs WHERE id=$1 AND status='open'",[id])).rows[0]}finally{await pool.end()}if (!job) notFound();return <RecruitmentWorkspace mode="jobs" jobId={id}/>;}
