import {publishJob,expireJobs} from '@/lib/job-publishing';
import {jobStates,JobPolicyError} from '@/lib/job-policy';
import {NextResponse} from 'next/server';
import {randomUUID} from 'node:crypto';
import {currentEmployer,db} from '@/lib/employer-session';
import {currentApplicant} from '@/lib/applicant-session';
import {stages,grade,type Question} from '@/lib/ats';
import {rejectionFeedback} from '@/lib/recruitment-feedback';
import {enrollWorkflows} from '@/lib/workflow-automation';
import {generateRoleAssessment} from '@/lib/role-assessment';
export const runtime='nodejs';
const bad=(error:string,status=400)=>NextResponse.json({error},{status});
export async function GET(request:Request){
 const view=new URL(request.url).searchParams.get('view');
 const employer=view==='employer'?await currentEmployer():null;
 const applicant=view!=='employer'?await currentApplicant():null;
 if(view==='employer'&&!employer||view==='applicant'&&!applicant)return bad('Sign in required',401);
 const pool=db();try{
 await expireJobs(pool);
 if(!employer&&!applicant){const r=await pool.query("SELECT j.id,j.title,j.location,j.country,j.employment_type,e.company_name FROM ats_jobs j JOIN employer_accounts e ON e.id=j.employer_id WHERE j.status='published' AND j.expires_at>NOW() AND (j.deadline IS NULL OR j.deadline>NOW()) ORDER BY j.created_at DESC");return NextResponse.json({jobs:r.rows,applications:[]})}
 const jobs=await pool.query(`SELECT j.*,e.company_name FROM ats_jobs j JOIN employer_accounts e ON e.id=j.employer_id WHERE ${employer?'j.employer_id=$1':"j.status='published' AND j.expires_at>NOW() AND (j.deadline IS NULL OR j.deadline>NOW())"} ORDER BY j.created_at DESC`,employer?[employer]:[]);
 if(!employer)for(const j of jobs.rows)j.questions=j.questions.map((q:Question)=>({prompt:q.prompt,options:q.options}));
 let applications:Record<string,unknown>[]=[];
 if(employer||applicant){const r=await pool.query(`SELECT a.*,(SELECT s.id FROM workforce_submissions s WHERE s.application_id=a.id AND s.title='Application CV' ORDER BY s.created_at DESC LIMIT 1) AS cv_document_id,j.title,j.questions,e.company_name,p.first_name,p.last_name,p.email,COALESCE((SELECT jsonb_agg(jsonb_build_object('stage',v.stage,'message',v.message,'created_at',v.created_at) ORDER BY v.created_at) FROM ats_events v WHERE v.application_id=a.id),'[]') AS events FROM ats_applications a JOIN ats_jobs j ON j.id=a.job_id JOIN employer_accounts e ON e.id=j.employer_id JOIN applicant_accounts p ON p.id=a.applicant_id WHERE ${employer?'j.employer_id=$1':'a.applicant_id=$1'} ORDER BY a.created_at DESC`,[employer||applicant]);applications=r.rows;
 if(!employer)for(const a of applications){a.questions=(a.questions as Question[]).map(q=>({prompt:q.prompt,options:q.options}));delete a.answers;}}
 return NextResponse.json({jobs:jobs.rows,applications});
 }catch{return bad('Recruitment data unavailable. Please retry.',503)}finally{await pool.end()}
}
export async function POST(request:Request){
 if(Number(request.headers.get('content-length'))>3000000)return bad('CV upload exceeds 2 MB',413);
 let b;try{b=await request.json()}catch{return bad('Invalid request')}
 const employer=await currentEmployer();const applicant=employer?null:await currentApplicant();
 if(!employer&&!applicant)return bad('Sign in as an applicant to apply, or as an employer to manage hiring.',401);
 const pool=db();const c=await pool.connect();try{
 await c.query('BEGIN');
 if(b.action==='job'){
 if(!employer)return bad('Employer access required',403);
 await c.query('SELECT id FROM employer_accounts WHERE id=$1 FOR UPDATE',[employer]);
 for(const f of ['title','department','location','country','employment_type','description'])if(typeof b[f]!=='string'||!b[f].trim()||b[f].length>20000)return bad('Complete all job fields');
 if(!['draft','published'].includes(b.status))return bad('Invalid status');
 const questions=b.questions?.length?b.questions:generateRoleAssessment(b.title,b.department,b.requirements);
 if(!Array.isArray(questions)||questions.length>20||questions.some(q=>!q||typeof q.prompt!=='string'||!q.prompt.trim()||q.prompt.length>2000||!Array.isArray(q.options)||q.options.length!==4||q.options.some((o:unknown)=>typeof o!=='string'||!o.trim()||o.length>1000)||!Number.isInteger(q.correct)||q.correct<0||q.correct>3))return bad('Each assessment question needs four choices and a correct answer');
 const id=randomUUID();await c.query('INSERT INTO ats_jobs(id,employer_id,title,department,location,country,employment_type,description,requirements,status,questions) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',[id,employer,b.title,b.department,b.location,b.country,b.employment_type,b.description,String(b.requirements||'').slice(0,20000),'draft',JSON.stringify(questions)]);
 if(b.status==='published')await publishJob(c,employer,id,b);
 await c.query('COMMIT');return NextResponse.json({id},{status:201});
 }
 if(b.action==='jobstatus'){
 if(!employer)return bad('Employer access required',403);
 await c.query('SELECT id FROM employer_accounts WHERE id=$1 FOR UPDATE',[employer]);
 if(!jobStates.includes(b.status))return bad('Invalid status');
 const changed=await c.query('SELECT * FROM ats_jobs WHERE id=$1 AND employer_id=$2 FOR UPDATE',[b.id,employer]);
 if(changed.rowCount){if(b.status==='published')await publishJob(c,employer,b.id,changed.rows[0]);else await c.query('UPDATE ats_jobs SET status=$1 WHERE id=$2 AND employer_id=$3',[b.status,b.id,employer]);}
 if(!changed.rowCount)return bad('Vacancy not found',404);
 await c.query('COMMIT');return NextResponse.json({ok:true});
 }
 if(b.action==='apply'){
 if(!applicant)return bad('Please use your independent applicant account',403);
 if(typeof b.cv_data!=='string'||b.cv_data.length>2800000||typeof b.cv_filename!=='string'||!b.cv_filename.toLowerCase().endsWith('.pdf'))return bad('Upload your CV as a PDF (maximum 2 MB)');
 const cv=Buffer.from(b.cv_data,'base64');if(cv.length<5||cv.length>2097152||cv.subarray(0,5).toString()!=='%PDF-')return bad('Upload a valid PDF CV (maximum 2 MB)');
 const job=await c.query("SELECT * FROM ats_jobs WHERE id=$1 AND status='published' AND expires_at>NOW() AND (deadline IS NULL OR deadline>NOW()) FOR SHARE",[b.job_id]);if(!job.rowCount)return bad('Job is no longer open',404);
 const questions=job.rows[0].questions as Question[];
 if(!questions.length)return bad('Assessment is being prepared. Please contact the employer.',409);
 if(!Array.isArray(b.answers)||b.answers.length!==questions.length||b.answers.some((n:unknown)=>!Number.isInteger(n)||Number(n)<0||Number(n)>3))return bad('Complete the role assessment before submitting your application');
 const score=grade(questions,b.answers);
 const id=randomUUID();const stage='screening';
 await c.query('INSERT INTO ats_applications(id,job_id,applicant_id,cv_text,stage) VALUES($1,$2,$3,$4,$5)',[id,b.job_id,applicant,'CV uploaded: '+b.cv_filename.slice(0,160),stage]);
 await c.query('INSERT INTO ats_events(id,application_id,stage,message) VALUES($1,$2,$3,$4)',[randomUUID(),id,stage,'Assessment scored automatically. Awaiting employer checks.']);
 await c.query('UPDATE ats_applications SET assessment_score=$1,answers=$2 WHERE id=$3',[score,JSON.stringify(b.answers),id]);
 await c.query('INSERT INTO workforce_submissions(id,employer_id,applicant_id,application_id,title,filename,mime,content) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[randomUUID(),job.rows[0].employer_id,applicant,id,'Application CV',b.cv_filename.slice(0,160),'application/pdf',cv]);
 await c.query('COMMIT');return NextResponse.json({id},{status:201});
 }
 const record=await c.query('SELECT a.*,j.employer_id,j.questions,j.title,j.department,j.location,p.first_name,p.last_name,p.email,p.phone FROM ats_applications a JOIN ats_jobs j ON j.id=a.job_id JOIN applicant_accounts p ON p.id=a.applicant_id WHERE a.id=$1 FOR UPDATE OF a',[b.id]);
 const a=record.rows[0];if(!a||employer&&a.employer_id!==employer||applicant&&a.applicant_id!==applicant)return bad('Application not found',404);
 let stage=a.stage;let message='';
 if(b.action==='accept_offer'){if(!applicant||a.stage!=='offer'||b.confirm!==true)return bad('A confirmed offer is required',409);stage='hired';message='Applicant accepted the employer offer. Onboarding started.';
 }else if(b.action==='assessment'){
 if(!applicant||a.stage!=='assessment'||a.assessment_score!==null)return bad('Assessment is not available',409);
 const q=a.questions as Question[];
 if(!q.length||!Array.isArray(b.answers)||b.answers.length!==q.length||b.answers.some((n:unknown)=>!Number.isInteger(n)||Number(n)<0||Number(n)>3))return bad('Answer every question');
 const score=grade(q,b.answers);stage='screening';message='Assessment completed. Awaiting HR review.';
 await c.query('UPDATE ats_applications SET assessment_score=$1,answers=$2 WHERE id=$3',[score,JSON.stringify(b.answers),a.id]);
 }else if(b.action==='update'){
 if(!employer)return bad('Employer access required',403);
 if(!stages.includes(b.stage))return bad('Invalid hiring stage');const newlyScheduled=!!b.interview_at;b.interview_at=b.interview_at||a.interview_at;
 if(a.stage==='hired'&&b.stage!=='hired')return bad('Manage this person through Employees after hiring',409);
 if(b.stage==='assessment'&&!a.questions.length)return bad('This vacancy has no assessment questions');
 if(b.stage==='interview'&&(!b.interview_at||!Number.isFinite(Date.parse(b.interview_at))))return bad('Set an interview date and time');
 stage=b.checks_passed===true?'shortlisted':b.stage;if(newlyScheduled&&stage==='shortlisted')stage='interview';message=String(b.feedback||'').trim().slice(0,5000)||'Application moved to '+stage;if(stage==='rejected'){let feedback;try{feedback=rejectionFeedback(b.rejection,a.title)}catch(err){return bad(err instanceof Error?err.message:'Complete rejection feedback')}message=feedback.message;b.feedback=message;await c.query('UPDATE ats_applications SET rejection_details=$1::jsonb WHERE id=$2',[JSON.stringify(feedback.details),a.id]);}if(b.interview_complete===true&&stage!=='rejected'){if(a.stage!=='interview'||!String(b.feedback||'').trim())return bad('Interview feedback is required before marking the interview complete');await c.query('UPDATE ats_applications SET interview_completed_at=NOW() WHERE id=$1',[a.id]);message='Interview completed. HR feedback: '+String(b.feedback).slice(0,2000);}
 await c.query('UPDATE ats_applications SET feedback=$1,interview_at=$2,interview_details=$3 WHERE id=$4',[String(b.feedback||'').slice(0,5000),b.interview_at||a.interview_at,String(b.interview_details||'').slice(0,2000),a.id]);
 if(stage==='interview'){let roomId=a.interview_room_id;if(!roomId){roomId=randomUUID();await c.query('INSERT INTO meet_rooms(id,employer_id,title,starts_at,duration_minutes) VALUES($1,$2,$3,$4,60)',[roomId,employer,'Interview: '+a.title,b.interview_at]);await c.query('UPDATE ats_applications SET interview_room_id=$1 WHERE id=$2',[roomId,a.id]);}else{await c.query('UPDATE meet_rooms SET starts_at=$1 WHERE id=$2 AND employer_id=$3',[b.interview_at,roomId,employer]);}await c.query('UPDATE ats_applications SET interview_details=$1 WHERE id=$2',['/meet/'+roomId,a.id]);}
 }else return bad('Unknown action');
 if(stage==='hired'&&!a.employee_id){const employeeId=randomUUID();const e=await c.query("INSERT INTO workforce_employees(id,employer_id,first_name,last_name,email,phone,job_title,department,location,hire_date) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,CURRENT_DATE) ON CONFLICT(employer_id,email) DO UPDATE SET updated_at=NOW() RETURNING id",[employeeId,a.employer_id,a.first_name,a.last_name,a.email,a.phone,a.title,a.department,a.location]);await c.query('UPDATE ats_applications SET employee_id=$1 WHERE id=$2',[e.rows[0].id,a.id]);}

 if(stage==='hired')await enrollWorkflows(c,a.employer_id);
 await c.query('UPDATE ats_applications SET stage=$1 WHERE id=$2',[stage,a.id]);
 await c.query('INSERT INTO ats_events(id,application_id,stage,message) VALUES($1,$2,$3,$4)',[randomUUID(),a.id,stage,message]);
 await c.query('COMMIT');return NextResponse.json({ok:true});
 }catch(e){await c.query('ROLLBACK');if(e instanceof JobPolicyError)return bad(e.message,422);return bad((e as {code?:string}).code==='23505'?'You have already applied for this job.':'Unable to save recruitment changes',409)}finally{await c.query('ROLLBACK').catch(()=>{});c.release();await pool.end()}
}
