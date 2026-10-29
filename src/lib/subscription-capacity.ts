import type {PoolClient} from 'pg';
export async function assertEmployeeCapacity(c:Pick<PoolClient,'query'>,employer:string,email?:string){
 // All employee entry points serialize on the same company row.
 await c.query('SELECT id FROM employer_accounts WHERE id=$1 FOR UPDATE',[employer]);
 const r=await c.query("SELECT employee_limit FROM company_subscriptions WHERE employer_id=$1 AND status='active' AND paid_until>NOW() AND employee_limit IS NOT NULL AND (capacity_enforced_from IS NULL OR capacity_enforced_from<=NOW())",[employer]);
 const limit=r.rows[0]?.employee_limit;if(!limit)return;
 if(email&&(await c.query('SELECT 1 FROM workforce_employees WHERE employer_id=$1 AND LOWER(email)=LOWER($2)',[employer,email])).rowCount)return;
 const n=await c.query("SELECT COUNT(*)::int AS total FROM workforce_employees WHERE employer_id=$1 AND employment_status IN ('active','probation','on_leave')",[employer]);
 if(n.rows[0].total>=limit)throw Error('Your subscription includes '+limit+' active employees. Choose a larger plan or request additional capacity before adding another employee.');
}
