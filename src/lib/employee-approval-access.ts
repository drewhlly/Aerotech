import {db} from './employer-session';
export async function employeeApprovalStages(employee:{id:string;employer_id:string}) {
 const pool=db();
 try {
  const result=await pool.query<{stage:string}>("SELECT stage FROM payroll_stage_approvers WHERE employer_id=$1 AND employee_id=$2",[employee.employer_id,employee.id]);
  return result.rows.map(row=>row.stage);
 } finally {await pool.end();}
}
export async function employeeCanReviewLeave(employee:{id:string;employer_id:string}) {
 const pool=db();
 try {
  const result=await pool.query("SELECT 1 FROM workforce_employees WHERE employer_id=$1 AND manager_employee_id=$2 AND id<>$2 AND employment_status IN ('active','probation','on_leave') LIMIT 1",[employee.employer_id,employee.id]);
  return !!result.rowCount;
 } finally {await pool.end();}
}
// Run before rendering so streamed layouts cannot turn access denials into HTTP 200.
export async function employeeRequestCanApprove(token:string|undefined,paymentsOnly=false) {
 if(!token)return false;
 const {createHash}=await import('node:crypto');
 const pool=db();
 try {
  const result=await pool.query(`SELECT 1 FROM employee_sessions s JOIN workforce_employees e ON e.id=s.employee_id
   WHERE s.token_hash=$1 AND s.expires_at>NOW() AND e.employment_status IN ('active','probation','on_leave')
   AND (EXISTS(SELECT 1 FROM payroll_stage_approvers p WHERE p.employer_id=e.employer_id AND p.employee_id=e.id AND (NOT $2::boolean OR p.stage='ceo'))
   OR (NOT $2::boolean AND EXISTS(SELECT 1 FROM workforce_employees r WHERE r.employer_id=e.employer_id AND r.manager_employee_id=e.id AND r.id<>e.id AND r.employment_status IN ('active','probation','on_leave'))))`,[createHash('sha256').update(token).digest('hex'),paymentsOnly]);
  return !!result.rowCount;
 } finally {await pool.end();}
}
