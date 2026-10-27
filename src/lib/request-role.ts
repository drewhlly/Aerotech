import {createHash} from 'node:crypto';
import type {NextRequest} from 'next/server';
import {db} from './employer-session';
import type {WorkspaceRole} from './portal-policy';
// Validate opaque session tokens against the database; cookie presence is not authority.
export async function requestRole(req:NextRequest):Promise<WorkspaceRole|'support'|null>{
 const roles=['employer','employee','applicant','support'] as const;
 if(!roles.some(r=>req.cookies.has('aerotech_'+r+'_session')))return null;
 const pool=db();
 try{for(const role of roles){const token=req.cookies.get('aerotech_'+role+'_session')?.value;if(!token)continue;
  const hash=createHash('sha256').update(token).digest('hex');
  const query=role==='support'?"SELECT a.is_super_admin FROM support_sessions s JOIN support_agents a ON a.id=s.agent_id WHERE s.token_hash=$1 AND s.expires_at>NOW() AND a.disabled=FALSE":role==='employee'?"SELECT 1 FROM employee_sessions s JOIN workforce_employees e ON e.id=s.employee_id WHERE s.token_hash=$1 AND s.expires_at>NOW() AND e.employment_status IN ('active','probation','on_leave')":`SELECT 1 FROM ${role}_sessions WHERE token_hash=$1 AND expires_at>NOW()`;
  const r=await pool.query(query,[hash]);if(r.rowCount)return role==='support'?(r.rows[0].is_super_admin?'admin':'support'):role;
 }return null}finally{await pool.end()}
}
