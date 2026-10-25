import type {Pool,PoolClient} from 'pg';
export async function syncPayslipNotifications(client:Pool|PoolClient,employer:string){return client.query(`INSERT INTO employee_notifications(id,employer_id,employee_id,title,body,source_key)
SELECT gen_random_uuid(),r.employer_id,w.id,'Payslip available','Your approved payroll statement for '||TO_CHAR(r.payroll_month,'Mon YYYY')||' is available. Open Payslips to view it.','payslip:'||r.id
FROM payable_payroll_runs r JOIN payroll_run_items i ON i.run_id=r.id JOIN payroll_employees pe ON pe.id=i.employee_id AND pe.employer_id=r.employer_id JOIN workforce_employees w ON LOWER(w.email)=LOWER(pe.email) AND w.employer_id=r.employer_id
WHERE r.employer_id=$1 ON CONFLICT(employer_id,employee_id,source_key) WHERE source_key IS NOT NULL DO NOTHING`,[employer])}
