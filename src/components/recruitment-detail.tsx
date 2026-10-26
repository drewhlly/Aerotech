import {notFound} from 'next/navigation';
import RecruitmentWorkspace from './recruitment-workspace';
import {currentEmployer,db} from '@/lib/employer-session';
export default async function RecruitmentDetail({id,kind}:{id:string;kind:'job'|'application'}){if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id))notFound();const employer=await currentEmployer();if(!employer)notFound();const p=db();try{const query=kind==='job'?'SELECT id FROM ats_jobs WHERE id=$1 AND employer_id=$2':'SELECT a.id FROM ats_applications a JOIN ats_jobs j ON j.id=a.job_id WHERE a.id=$1 AND j.employer_id=$2';if(!(await p.query(query,[id,employer])).rowCount)notFound();return <RecruitmentWorkspace mode="employer" {...(kind==='job'?{jobId:id}:{applicationId:id})}/>}finally{await p.end()}}
