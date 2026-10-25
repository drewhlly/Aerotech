import {supportAgent} from './support-session';import {db} from './employer-session';
export async function superAdmin(){const agent=await supportAgent();if(!agent)return null;const p=db();try{const r=await p.query('SELECT id,display_name FROM support_agents WHERE id=$1 AND is_super_admin=TRUE AND disabled=FALSE',[agent.id]);return r.rows[0]||null}finally{await p.end()}}
