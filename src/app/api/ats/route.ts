import {validQuestions,validReview} from '@/lib/assessment-review';
import {queueEmployeeActivation} from '@/lib/activation-delivery';
import {assessmentPolicy,publicAssessmentPolicy,screeningStage} from '@/lib/recruitment-screening';
import {scheduleInterview,retireInterview} from '@/lib/recruitment-interviews';
import {employerPipeline,pipelineBounds} from '@/lib/recruitment-query';
import {activeMeeting} from '@/lib/notification-policy';
import {assertEmployeeCapacity} from '@/lib/subscription-capacity';
import {publishJob,expireJobs} from '@/lib/job-publishing';
import {jobStates,JobPolicyError,JobRateLimitError} from '@/lib/job-policy';
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
 const params=new URL(request.url).searchParams;
 const view=params.get('view'),vacancies=params.get('vacancies')||'active',selectedJob=params.get('job_id');
 if(!['active','drafts','history'].includes(vacancies))return bad('Invalid vacancy view');
 const employer=view==='employer'?await currentEmployer():null;
 const applicant=view!=='employer'?await currentApplicant():null;
 if(view==='employer'&&!employer||view==='applicant'&&!applicant)return bad('Sign in required',401);
 if(employer&&params.has('candidate_limit')){try{pipelineBounds(params)}catch{return bad('Invalid candidate stage')}}
 const pool=db();try{
 await expireJobs(pool);
 if(!employer&&!applicant){const r=await pool.query("SELECT j.id,j.title,j.location,j.country,j.employment_type,e.company_name FROM ats_jobs j JOIN employer_accounts e ON e.id=j.employer_id WHERE j.status='published' AND j.expires_at>NOW() AND (j.deadline IS NULL OR j.deadline>NOW()) ORDER BY j.created_at DESC");return NextResponse.json({jobs:r.rows,applications:[]})}
 const jobs=await pool.query(`SELECT j.*,e.company_name FROM ats_jobs j JOIN employer_accounts e ON e.id=j.employer_id WHERE ${employer?"j.employer_id=$1 AND ($2::text IS NOT NULL AND j.id::text=$2 OR $2::text IS NULL AND (CASE $3::text WHEN 'drafts' THEN j.status='draft' WHEN 'history' THEN j.status IN ('closed','expired','archived') ELSE j.status='published' AND j.expires_at>NOW() AND (j.deadline IS NULL OR j.deadline>NOW()) END))":"j.status='published' AND j.expires_at>NOW() AND (j.deadline IS NULL OR j.deadline>NOW())"} ORDER BY j.created_at DESC`,employer?[employer,selectedJob,vacancies]:[]);
 if(employer&&params.has('candidate_limit'))return NextResponse.json({jobs:jobs.rows,...await employerPipeline(pool,employer,params)},{headers:{'Cache-Control':'private, no-store'}});
 if(!employer)for(const j of jobs.rows){j.questions=j.questions.map((q:Question)=>({prompt:q.prompt,options:q.options}));delete j.assessment_review_notes;}
 let applications:Record<string,unknown>[]=[];
 if(employer||applicant){const r=await pool.query(`SELECT a.*,m.starts_at+m.duration_minutes*INTERVAL '1 minute' AS interview_end_at,COALESCE((${activeMeeting}),FALSE) AS interview_active,(SELECT s.id FROM workforce_submissions s WHERE s.application_id=a.id AND s.title='Application CV' ORDER BY s.created_at DESC LIMIT 1) AS cv_document_id,j.title,j.questions,e.company_name,p.first_name,p.last_name,p.email,COALESCE((SELECT jsonb_agg(jsonb_build_object('stage',v.stage,'message',v.message,'created_at',v.created_at) ORDER BY v.created_at) FROM ats_events v WHERE v.application_id=a.id),'[]') AS events FROM ats_applications a JOIN ats_jobs j ON j.id=a.job_id JOIN employer_accounts e ON e.id=j.employer_id JOIN applicant_accounts p ON p.id=a.applicant_id LEFT JOIN meet_rooms m ON m.id=a.interview_room_id AND m.employer_id=j.employer_id WHERE ${employer?'j.employer_id=$1':'a.applicant_id=$1'} ORDER BY a.created_at DESC`,[employer||applicant]);applications=r.rows;
 if(!employer)for(const a of applications){const policy=publicAssessmentPolicy(a.assessment_policy);a.questions=policy?.questions||(a.questions as Question[]).map(q=>({prompt:q.prompt,options:q.options}));a.assessment_policy=policy;delete a.answers;}}
 return NextResponse.json({jobs:jobs.rows,applications});
 }catch{return bad('Recruitment data unavailable. Please retry.',503)}finally{await pool.end()}
}
export async function POST(request:Request){
 if(Number(request.headers.get('content-length'))>3000000)return bad('CV upload exceeds 2 MB',413);
 let b;try{b=await request.json()}catch{return bad('Invalid request')}
 if(!b||typeof b!=='object'||Array.isArray(b))return bad('Invalid request');
 const employer=await currentEmployer();const applicant=employer?null:await currentApplicant();
 if(!employer&&!applicant)return bad('Sign in as an applicant to apply, or as an employer to manage hiring.',401);
 const pool=db();const c=await pool.connect();try{
 await c.query('BEGIN');
 if(b.action==='preview_assessment'){if(!employer)return bad('Employer access required',403);if(typeof b.title!=='string'||!b.title.trim()||b.title.length>255||typeof b.department!=='string'||b.department.length>255||typeof b.requirements!=='string'||b.requirements.length>20000)return bad('Complete the role title, department and requirements.');await c.query('COMMIT');return NextResponse.json({questions:generateRoleAssessment(b.title,b.department,b.requirements)});}
 if(b.action==='review_assessment'){if(!employer)return bad('Employer access required',403);if(b.confirm!==true||!validReview(b.notes))return bad('Confirm review and record role-related criteria (20–2000 characters).');const row=await c.query('SELECT questions FROM ats_jobs WHERE id::text=$1 AND employer_id=$2 FOR UPDATE',[String(b.id),employer]);if(!row.rowCount)return bad('Role not found',404);if(!validQuestions(row.rows[0].questions))return bad('Add a complete question set before reviewing.',422);await c.query('UPDATE ats_jobs SET assessment_reviewed_at=NOW(),assessment_review_notes=$3 WHERE id::text=$1 AND employer_id=$2',[String(b.id),employer,b.notes.trim()]);await c.query("INSERT INTO collaboration_audit(employer_id,actor,action,resource_id,details) VALUES($1,'employer','assessment_content_reviewed',$2,$3)",[employer,String(b.id),JSON.stringify({notes:b.notes.trim()})]);await c.query('COMMIT');return NextResponse.json({ok:true});}
 if(b.action==='job'){
 if(!employer)return bad('Employer access required',403);
 await c.query('SELECT id FROM employer_accounts WHERE id=$1 FOR UPDATE',[employer]);
 for(const f of ['title','department','location','country','employment_type','description'])if(typeof b[f]!=='string'||!b[f].trim()||b[f].length>20000)return bad('Complete all job fields');
 if(!['draft','published'].includes(b.status))return bad('Invalid status');
 const questions=b.questions?.length?b.questions:generateRoleAssessment(b.title,b.department,b.requirements);
 if(!Array.isArray(questions)||questions.length>20||questions.some(q=>!q||typeof q.prompt!=='string'||!q.prompt.trim()||q.prompt.length>2000||!Array.isArray(q.options)||q.options.length!==4||q.options.some((o:unknown)=>typeof o!=='string'||!o.trim()||o.length>1000)||!Number.isInteger(q.correct)||q.correct<0||q.correct>3))return bad('Each assessment question needs four choices and a correct answer');
 const threshold=b.qualifying_score===undefined?85:Number(b.qualifying_score);if(!Number.isInteger(threshold)||threshold<0||threshold>100)return bad('Qualifying score must be from 0 to 100.');
 if(b.status==='published'&&(b.assessment_reviewed!==true||!validReview(b.assessment_review_notes)||!validQuestions(b.questions)))return bad('Preview or add assessment questions and record your review before publishing.',422);
 const draftDeadline=b.deadline?new Date(String(b.deadline)):null;
 if(draftDeadline&&(!Number.isFinite(draftDeadline.getTime())||draftDeadline.getTime()<=Date.now()))return bad('Deadline must be in the future');
 const id=randomUUID();await c.query('INSERT INTO ats_jobs(id,employer_id,title,department,location,country,employment_type,description,requirements,status,questions,qualifying_score,deadline) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',[id,employer,b.title,b.department,b.location,b.country,b.employment_type,b.description,String(b.requirements||'').slice(0,20000),'draft',JSON.stringify(questions),threshold,draftDeadline]);
 if(b.assessment_reviewed===true&&validReview(b.assessment_review_notes)&&validQuestions(b.questions))await c.query('UPDATE ats_jobs SET assessment_reviewed_at=NOW(),assessment_review_notes=$2 WHERE id=$1',[id,b.assessment_review_notes.trim()]);
 if(b.status==='published')await publishJob(c,employer,id,b);
 await c.query('COMMIT');return NextResponse.json({id},{status:201});
 }
 if(b.action==='jobstatus'){
 if(!employer)return bad('Employer access required',403);
 await c.query('SELECT id FROM employer_accounts WHERE id=$1 FOR UPDATE',[employer]);
 if(!jobStates.includes(b.status))return bad('Invalid status');
 const changed=await c.query('SELECT * FROM ats_jobs WHERE id=$1 AND employer_id=$2 FOR UPDATE',[b.id,employer]);
 if(changed.rowCount){if(b.status==='published'){if(!changed.rows[0].assessment_reviewed_at)return bad('Review the assessment content before publishing this role.',422);await publishJob(c,employer,b.id,changed.rows[0]);}else await c.query('UPDATE ats_jobs SET status=$1 WHERE id=$2 AND employer_id=$3',[b.status,b.id,employer]);}
 if(!changed.rowCount)return bad('Vacancy not found',404);
 await c.query('COMMIT');return NextResponse.json({ok:true});
 }
 if(b.action==='threshold'){if(!employer)return bad('Employer access required',403);if(!Number.isInteger(b.threshold)||b.threshold<0||b.threshold>100)return bad('Qualifying score must be from 0 to 100.');const job=await c.query('SELECT id FROM ats_jobs WHERE employer_id=$1 AND id::text=$2 FOR UPDATE',[employer,String(b.id)]);if(!job.rowCount)return bad('Vacancy not found',404);if((await c.query('SELECT 1 FROM ats_applications WHERE job_id=$1 LIMIT 1',[job.rows[0].id])).rowCount)return bad('Threshold locked because applications have begun.',409);await c.query('UPDATE ats_jobs SET qualifying_score=$2 WHERE id=$1',[job.rows[0].id,b.threshold]);await c.query('COMMIT');return NextResponse.json({ok:true});}
 if(b.action==='apply'){
 if(!applicant)return bad('Use your independent applicant account',403);await c.query('SELECT id FROM applicant_accounts WHERE id=$1 FOR UPDATE',[applicant]);const profile=(await c.query('SELECT * FROM applicant_career_profiles WHERE applicant_id=$1',[applicant])).rows[0];if(!profile?.general_completed_at||!profile.cv_content||!profile.reviewed_at)return bad('Complete your career profile, CV and general assessment before applying.',422);if(b.consent!==true)return bad('Confirm sharing your profile, CV and assessments with this employer.');const job=await c.query("SELECT * FROM ats_jobs WHERE id::text=$1 AND status='published' AND expires_at>NOW() AND (deadline IS NULL OR deadline>NOW()) FOR SHARE",[String(b.job_id)]);if(!job.rowCount)return bad('Job is no longer open',404);if(!job.rows[0].assessment_reviewed_at)return bad('The employer is reviewing the assessment for this role. Please check back later.',409);const questions=job.rows[0].questions as Question[];if(!questions.length)return bad('The employer is preparing this assessment.',409);const id=randomUUID(),stage='assessment',policy={version:1,threshold:job.rows[0].qualifying_score,questions,general_score:profile.general_score,profile:{skills:profile.skills,experience:profile.experience,education:profile.education},submitted_at:new Date().toISOString()};await c.query('INSERT INTO ats_applications(id,job_id,applicant_id,cv_text,stage,assessment_policy) VALUES($1,$2,$3,$4,$5,$6)',[id,job.rows[0].id,applicant,'CV uploaded: '+profile.cv_filename,stage,JSON.stringify(policy)]);await c.query('INSERT INTO ats_events(id,application_id,stage,message) VALUES($1,$2,$3,$4)',[randomUUID(),id,stage,'Application submitted. Complete the job-specific assessment next. Qualifying score: '+policy.threshold+'%.']);await c.query('INSERT INTO workforce_submissions(id,employer_id,applicant_id,application_id,title,filename,mime,content) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[randomUUID(),job.rows[0].employer_id,applicant,id,'Application CV',profile.cv_filename,'application/pdf',profile.cv_content]);await c.query('COMMIT');return NextResponse.json({id},{status:201});
 }
 const owner=await c.query('SELECT j.employer_id FROM ats_applications a JOIN ats_jobs j ON j.id=a.job_id WHERE a.id::text=$1 AND ($2::uuid IS NOT NULL AND j.employer_id=$2 OR $3::uuid IS NOT NULL AND a.applicant_id=$3)',[String(b.id),employer,applicant]);if(!owner.rowCount)return bad('Application not found',404);await c.query('SELECT id FROM employer_accounts WHERE id=$1 FOR UPDATE',[owner.rows[0].employer_id]);
 const record=await c.query('SELECT a.*,j.employer_id,j.questions,j.title,j.department,j.location,p.first_name,p.last_name,p.email,p.phone FROM ats_applications a JOIN ats_jobs j ON j.id=a.job_id JOIN applicant_accounts p ON p.id=a.applicant_id LEFT JOIN meet_rooms m ON m.id=a.interview_room_id AND m.employer_id=j.employer_id WHERE a.id=$1 FOR UPDATE OF a',[b.id]);
 const a=record.rows[0];if(!a||employer&&a.employer_id!==employer||applicant&&a.applicant_id!==applicant)return bad('Application not found',404);
 let stage=a.stage;let message='';
 if(b.action==='accept_offer'){if(!applicant||a.stage!=='offer'||b.confirm!==true)return bad('A confirmed offer is required',409);stage='hired';message='Applicant accepted the employer offer. Onboarding started.';
 }else if(b.action==='assessment'){
 if(!applicant)return bad('Applicant access required',403);if(a.assessment_score!==null){if(JSON.stringify(a.answers)===JSON.stringify(b.answers)){await c.query('COMMIT');return NextResponse.json({ok:true,reused:true});}return bad('Assessment complete. Contact support for review.',409);}if(a.stage!=='assessment')return bad('Assessment is not available',409);
 const policy=assessmentPolicy(a.assessment_policy);const q=policy?.questions||a.questions as Question[];
 if(!q.length||!Array.isArray(b.answers)||b.answers.length!==q.length||b.answers.some((n:unknown)=>!Number.isInteger(n)||Number(n)<0||Number(n)>3))return bad('Answer every question');
 const score=grade(q,b.answers);stage=policy?screeningStage(score,policy.threshold):'screening';message=policy?'Assessment scored '+score+'%. Qualifying score: '+policy.threshold+'%. '+(stage==='shortlisted'?'Eligible for interview; HR makes the final decision.':'Below the standard shortlist threshold. You may request a human review through support.'):'Assessment completed. Awaiting HR review.';
 await c.query('UPDATE ats_applications SET assessment_score=$1,answers=$2 WHERE id=$3',[score,JSON.stringify(b.answers),a.id]);
 }else if(b.action==='update'){
 if(!employer)return bad('Employer access required',403);
 if(b.expected_stage!==undefined&&b.expected_stage!==a.stage)return bad('This candidate has changed. Refresh the pipeline before saving.',409);
 if(!stages.includes(b.stage))return bad('Invalid hiring stage');const policy=assessmentPolicy(a.assessment_policy),target=b.checks_passed===true?'shortlisted':b.stage;
 if(policy&&['shortlisted','interview','offer','hired'].includes(target)&&(a.assessment_score===null||a.assessment_score<policy.threshold)&&!policy.review){if(a.assessment_score===null)return bad('Complete the job-specific assessment before advancing.',422);if(typeof b.review_reason!=='string'||b.review_reason.trim().length<20||b.review_reason.length>2000)return bad('Record a job-related human review reason (20–2000 characters) to advance below the qualifying score.',422);policy.review={reason:b.review_reason.trim(),at:new Date().toISOString()};await c.query('UPDATE ats_applications SET assessment_policy=$2 WHERE id=$1',[a.id,JSON.stringify(policy)]);await c.query("INSERT INTO collaboration_audit(employer_id,actor,action,resource_id,details) VALUES($1,'employer','assessment_review_override',$2,$3)",[employer,a.id,JSON.stringify({reason:policy.review.reason,threshold:policy.threshold,score:a.assessment_score})]);}if(policy&&['offer','hired'].includes(target)&&!a.interview_completed_at)return bad('Record interview feedback before an offer or hire.',422);
 const newlyScheduled=!!b.interview_at;b.interview_at=b.interview_at||a.interview_at;
 if(a.stage==='hired'&&b.stage!=='hired')return bad('Manage this person through Employees after hiring',409);
 if(b.stage==='assessment'&&!a.questions.length)return bad('This vacancy has no assessment questions');
 if(b.stage==='interview'&&(!b.interview_at||!Number.isFinite(Date.parse(b.interview_at))))return bad('Set an interview date and time');
 if(newlyScheduled&&Date.parse(b.interview_at)<Date.now()-60000)return bad('Choose an interview time in the future');
 stage=b.checks_passed===true?'shortlisted':b.stage;if(newlyScheduled&&stage==='shortlisted')stage='interview';message=String(b.feedback||'').trim().slice(0,5000)||'Application moved to '+stage;if(stage==='rejected'){let feedback;try{feedback=rejectionFeedback(b.rejection,a.title)}catch(err){return bad(err instanceof Error?err.message:'Complete rejection feedback')}message=feedback.message;b.feedback=message;await c.query('UPDATE ats_applications SET rejection_details=$1::jsonb WHERE id=$2',[JSON.stringify(feedback.details),a.id]);}if(b.interview_complete===true&&stage!=='rejected'){if(a.stage!=='interview'||!String(b.feedback||'').trim())return bad('Interview feedback is required before marking the interview complete');await c.query('UPDATE ats_applications SET interview_completed_at=NOW() WHERE id=$1',[a.id]);if(a.interview_room_id)await retireInterview(c,employer,a.interview_room_id,'ended');message='Interview completed. HR feedback: '+String(b.feedback).slice(0,2000);}
 await c.query('UPDATE ats_applications SET feedback=$1,interview_at=$2,interview_details=$3 WHERE id=$4',[String(b.feedback||'').slice(0,5000),b.interview_at||a.interview_at,String(b.interview_details||'').slice(0,2000),a.id]);
 if(stage==='interview'&&(newlyScheduled||!a.interview_room_id))await scheduleInterview(c,employer,a.id,a.interview_room_id,a.title,b.interview_at);
 if(stage!=='interview'&&a.interview_room_id)await retireInterview(c,employer,a.interview_room_id,'cancelled');
 }else return bad('Unknown action');
 if(stage==='hired'&&!a.employee_id){await assertEmployeeCapacity(c,a.employer_id,a.email);const employeeId=randomUUID();const e=await c.query("INSERT INTO workforce_employees(id,employer_id,first_name,last_name,email,phone,job_title,department,location,hire_date) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,CURRENT_DATE) ON CONFLICT(employer_id,email) DO UPDATE SET updated_at=NOW() RETURNING id",[employeeId,a.employer_id,a.first_name,a.last_name,a.email,a.phone,a.title,a.department,a.location]);await c.query('UPDATE ats_applications SET employee_id=$1 WHERE id=$2',[e.rows[0].id,a.id]);}

 if(stage==='hired'){await enrollWorkflows(c,a.employer_id);const hired=await c.query('SELECT employee_id FROM ats_applications WHERE id=$1',[a.id]);if(hired.rows[0]?.employee_id)await queueEmployeeActivation(c,a.employer_id,hired.rows[0].employee_id,'hire:'+a.id);}
 await c.query('UPDATE ats_applications SET stage=$1 WHERE id=$2',[stage,a.id]);
 await c.query('INSERT INTO ats_events(id,application_id,stage,message) VALUES($1,$2,$3,$4)',[randomUUID(),a.id,stage,message]);
 await c.query('COMMIT');return NextResponse.json({ok:true});
 }catch(e){await c.query('ROLLBACK');if(e instanceof JobRateLimitError)return bad(e.message,429);if(e instanceof JobPolicyError)return bad(e.message,422);return bad((e as {code?:string}).code==='23505'?'You have already applied for this job.':'Unable to save recruitment changes',409)}finally{await c.query('ROLLBACK').catch(()=>{});c.release();await pool.end()}
}
