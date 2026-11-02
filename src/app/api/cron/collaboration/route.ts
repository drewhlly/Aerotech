import {db} from '@/lib/employer-session';
import {runCommunicationJobs} from '@/lib/communication-worker';
import {schedulerAuthorized} from '@/lib/scheduler-auth';
import {runCollaborationJobs} from '@/lib/collaboration-worker';
import {respond} from '@/lib/collaboration';
export const runtime='nodejs';
export const maxDuration=120;
export async function GET(req:Request){
 if(!await schedulerAuthorized(req))return respond({error:'Unauthorized'},401);
 const p=db();
 try{
  const [work,mail]=await Promise.allSettled([runCollaborationJobs(),runCommunicationJobs(p)]);
  const collaboration=work.status==='fulfilled'?work.value:{processed:0,failed:1};
  const communications=mail.status==='fulfilled'?mail.value:{processed:0,failed:1};
  const failed=collaboration.failed+communications.failed;
  return respond({processed:collaboration.processed+communications.processed,failed,collaboration,communications},failed?503:200);
 }finally{await p.end();}
}
