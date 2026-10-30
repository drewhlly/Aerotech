import type {Pool} from 'pg';
import {stages} from './ats';
import {activeMeeting} from './notification-policy';
export function pipelineBounds(params:URLSearchParams){
 const limit=Math.min(50,Math.max(1,parseInt(params.get('candidate_limit')||'20')||20));
 const offset=Math.min(100000,Math.max(0,parseInt(params.get('candidate_offset')||'0')||0));
 const stage=params.get('candidate_id')?'all':params.get('candidate_stage')||'active';
 if(!['active','history','all',...stages].includes(stage))throw new Error('Invalid candidate stage');
 return {limit,offset,stage};
}
export async function employerPipeline(pool:Pool,employer:string,params:URLSearchParams){
 const {limit,offset,stage}=pipelineBounds(params);
 const values=[employer,(params.get('candidate_q')||'').trim().slice(0,120),params.get('candidate_job')||'',params.get('candidate_id')||''];
 const from=`FROM ats_applications a JOIN ats_jobs j ON j.id=a.job_id JOIN applicant_accounts p ON p.id=a.applicant_id LEFT JOIN meet_rooms m ON m.id=a.interview_room_id AND m.employer_id=j.employer_id`;
 const base=`j.employer_id=$1 AND ($2='' OR concat_ws(' ',p.first_name,p.last_name,p.email,j.title) ILIKE '%'||$2||'%') AND ($3='' OR j.id::text=$3) AND ($4='' OR a.id::text=$4)`;
 const scope=`CASE $5::text WHEN 'active' THEN a.stage NOT IN ('hired','rejected') WHEN 'history' THEN a.stage IN ('hired','rejected') WHEN 'all' THEN TRUE ELSE a.stage=$5 END`;
 const [rows,counts,roles,jobs]=await Promise.all([
  pool.query(`SELECT a.id,a.job_id,a.stage,a.assessment_score,a.interview_at,a.interview_room_id,a.interview_completed_at,a.feedback,a.created_at,a.employee_id,j.title,p.first_name,p.last_name,p.email,m.starts_at+m.duration_minutes*INTERVAL '1 minute' AS interview_end_at,COALESCE((${activeMeeting}),FALSE) AS interview_active,(SELECT s.id FROM workforce_submissions s WHERE s.application_id=a.id AND s.employer_id=j.employer_id AND s.title='Application CV' ORDER BY s.created_at DESC LIMIT 1) AS cv_document_id,COALESCE((SELECT jsonb_agg(x ORDER BY x.created_at) FROM (SELECT v.stage,v.message,v.created_at FROM ats_events v WHERE v.application_id=a.id ORDER BY v.created_at DESC LIMIT 20) x),'[]') AS events ${from} WHERE ${base} AND (${scope}) ORDER BY a.created_at DESC,a.id LIMIT $6 OFFSET $7`,[...values,stage,limit,offset]),
  pool.query(`SELECT a.stage,COUNT(*)::int AS count,COUNT(*) FILTER(WHERE a.stage='interview' AND (${activeMeeting}))::int AS upcoming ${from} WHERE ${base} GROUP BY a.stage`,values),
  pool.query('SELECT id,title FROM ats_jobs WHERE employer_id=$1 ORDER BY title,id',[employer]),
  pool.query("SELECT COUNT(*) FILTER(WHERE status='published' AND expires_at>NOW() AND (deadline IS NULL OR deadline>NOW()))::int AS active,COUNT(*) FILTER(WHERE status='draft')::int AS drafts,COUNT(*) FILTER(WHERE status IN ('closed','expired','archived'))::int AS history FROM ats_jobs WHERE employer_id=$1",[employer])
 ]);
 const stageCounts:Record<string,number>=Object.fromEntries(stages.map(s=>[s,0]));let upcoming=0;
 for(const row of counts.rows){stageCounts[row.stage]=row.count;upcoming+=row.upcoming}
 const active=stages.filter(s=>!['hired','rejected'].includes(s)).reduce((n,s)=>n+stageCounts[s],0);
 const total=stage==='active'?active:stage==='history'?stageCounts.hired+stageCounts.rejected:stage==='all'?Object.values(stageCounts).reduce((a,b)=>a+b,0):stageCounts[stage];
 return {applications:rows.rows,roles:roles.rows,pagination:{limit,offset,total},summary:{stages:stageCounts,active,review:stageCounts.applied+stageCounts.screening,interviews:upcoming,jobs:jobs.rows[0]}};
}
