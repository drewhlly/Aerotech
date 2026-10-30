import type {PoolClient} from 'pg';
import {randomUUID} from 'node:crypto';
import {enqueue} from './collaboration';
export async function retireInterview(client:PoolClient,employer:string,room:string,status:'ended'|'cancelled'){
 const result=await client.query('SELECT id,status,revoked_at,join_generation FROM meet_rooms WHERE id=$1 AND employer_id=$2 FOR UPDATE',[room,employer]);
 const meeting=result.rows[0];if(!meeting||meeting.status!=='scheduled'||meeting.revoked_at)return;
 await enqueue(client,employer,'meeting_terminate','terminate:'+room+':'+meeting.join_generation,{meeting:room,generation:meeting.join_generation});
 await client.query('UPDATE meet_rooms SET status=$3,revoked_at=NOW(),join_generation=join_generation+1 WHERE id=$1 AND employer_id=$2',[room,employer,status]);
}
export async function scheduleInterview(client:PoolClient,employer:string,application:string,previous:string|null,title:string,startsAt:string){
 if(previous)await retireInterview(client,employer,previous,'cancelled');
 const room=randomUUID();
 await client.query('INSERT INTO meet_rooms(id,employer_id,title,starts_at,duration_minutes) VALUES($1,$2,$3,$4,60)',[room,employer,'Interview: '+title,startsAt]);
 await client.query('UPDATE ats_applications SET interview_room_id=$1,interview_completed_at=NULL,interview_details=$2 WHERE id=$3',[room,'/meet/'+room,application]);
 return room;
}
