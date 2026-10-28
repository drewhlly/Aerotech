import {randomUUID} from "node:crypto";
import type {PoolClient} from "pg";
export async function audit(client:PoolClient,employer:string,ticket:string,kind:"company"|"support",actor:string,action:string,details:Record<string,unknown>={}){
 await client.query("INSERT INTO support_audit(id,employer_id,ticket_id,actor_type,actor_id,action,details) VALUES($1,$2,$3,$4,$5,$6,$7::jsonb)",[randomUUID(),employer,ticket,kind,actor,action,JSON.stringify(details)]);
}
export const ticketSelect="SELECT id,title,description,status,resolution,created_at,closed_at FROM support_tickets";
export async function ticketHistory(client:PoolClient,id:string){
 const grants=await client.query("SELECT id,scopes,approved_at,expires_at,revoked_at,revoked_at IS NULL AND expires_at>NOW() AS active FROM support_grants WHERE ticket_id=$1 ORDER BY approved_at DESC",[id]);
 const events=await client.query("SELECT a.id,a.actor_type,CASE WHEN a.actor_type='support' THEN COALESCE(s.display_name,'Aerotech Support') ELSE 'Company admin' END AS actor_name,a.action,a.details,a.created_at FROM support_audit a LEFT JOIN support_agents s ON s.id=a.actor_id AND a.actor_type='support' WHERE a.ticket_id=$1 ORDER BY a.created_at ASC,a.id ASC",[id]);
 return {grants:grants.rows,events:events.rows};
}
