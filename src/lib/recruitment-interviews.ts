import type {PoolClient} from 'pg';
import {randomUUID} from 'node:crypto';
import {enqueue} from './collaboration';
export async function retireInterview(client:PoolClient,employer:string,room:string,status:'ended'|'cancelled'){
 const result=await client.query('SELECT id,status,revoked_at,join_generation FROM meet_rooms WHERE id=$1 AND employer_id=$2 FOR UPDATE',[room,employer]);
 const meeting=result.rows[0];if(!meeting||meeting.status!=='scheduled'||meeting.revoked_at)return;
 await enqueue(client,employer,'meeting_terminate','terminate:'+room+':'+meeting.join_generation,{meeting:room,generation:meeting.join_generation});
 await client.query('UPDATE meet_rooms SET status=$3,revoked_at=NOW(),join_generation=join_generation+1 WHERE id=$1 AND employer_id=$2',[room,employer,status]);
 if(status==='cancelled')await client.query("UPDATE recruitment_interview_slots s SET status=CASE WHEN s.starts_at>NOW()+INTERVAL '30 minutes' THEN 'open' ELSE 'cancelled' END,application_id=NULL FROM ats_applications a WHERE a.id=s.application_id AND a.interview_room_id=$1 AND s.employer_id=$2",[room,employer]);
}
export async function scheduleInterview(client:PoolClient,employer:string,application:string,previous:string|null,title:string,startsAt:string,duration=60,interviewer:string|null=null){
 await client.query('SELECT id FROM employer_accounts WHERE id=$1 FOR UPDATE',[employer]);
 await client.query("UPDATE recruitment_interview_slots SET status=CASE WHEN starts_at>NOW()+INTERVAL '30 minutes' THEN 'open' ELSE 'cancelled' END,application_id=NULL WHERE employer_id=$1 AND application_id=$2",[employer,application]);
 if(previous)await retireInterview(client,employer,previous,'cancelled');
 const room=randomUUID();
 await client.query('INSERT INTO meet_rooms(id,employer_id,title,starts_at,duration_minutes) VALUES($1,$2,$3,$4,$5)',[room,employer,'Interview: '+title,startsAt,duration]);
 if(interviewer)await client.query("INSERT INTO meet_participants(employer_id,room_id,employee_id,required) SELECT $1,$2,id,TRUE FROM workforce_employees WHERE employer_id=$1 AND id=$3 AND employment_status IN ('active','probation','on_leave')",[employer,room,interviewer]);
 const changed=await client.query('UPDATE ats_applications SET interview_room_id=$1,interview_completed_at=NULL,interview_details=$2,interview_at=$4,interview_revision=interview_revision+1 WHERE id=$3 RETURNING interview_revision',[room,'/meet/'+room,application,startsAt]);
 await enqueue(client,employer,'interview_update','interview:'+application+':'+changed.rows[0].interview_revision,{application,revision:changed.rows[0].interview_revision});
 return room;
}
