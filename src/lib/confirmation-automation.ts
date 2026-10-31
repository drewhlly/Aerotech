import type {Pool,PoolClient} from 'pg';
/** Apply an HR-approved decision when due; never infer termination from a review. */
export async function applyScheduledConfirmations(client:Pick<Pool|PoolClient,'query'>,employer:string){
 return client.query(`UPDATE workforce_employees w SET employment_status='active',updated_at=NOW()
 FROM (SELECT DISTINCT ON(employee_id) employee_id,decision,effective_date FROM employee_confirmation_decisions WHERE employer_id=$1 ORDER BY employee_id,created_at DESC,id DESC) d
 WHERE w.employer_id=$1 AND w.id=d.employee_id AND w.employment_status='probation' AND d.decision='confirmed' AND d.effective_date<=CURRENT_DATE RETURNING w.id`,[employer]);
}
