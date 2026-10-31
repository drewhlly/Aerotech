import type {PoolClient} from 'pg';
import {randomUUID} from 'node:crypto';
export async function notifyRequestDecision(client:PoolClient,company:string,request:{id:string;employee_id:string;request_type:string;status:string}){
 const name=request.request_type.replaceAll('_',' ');
 await client.query(`INSERT INTO employee_notifications(id,employer_id,employee_id,title,body,source_key)
 VALUES($1,$2,$3,'Request '||$4::text,'Your '||$5::text||' request has been '||$4::text||'. Open your request history to view the decision.',$6)
 ON CONFLICT(employer_id,employee_id,source_key) WHERE source_key IS NOT NULL DO NOTHING`,[randomUUID(),company,request.employee_id,request.status,name,'request-decision:'+request.id]);
}
