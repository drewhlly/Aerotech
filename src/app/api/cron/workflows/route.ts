import {expireJobs} from '@/lib/job-publishing';
import {NextResponse} from 'next/server';
import {timingSafeEqual} from 'node:crypto';
import {db} from '@/lib/employer-session';
import {enrollWorkflows,generateMonthlyReport} from '@/lib/workflow-automation';
export const runtime='nodejs';
export const maxDuration=300;
export async function GET(req:Request){
 const expected=Buffer.from(process.env.CRON_SECRET||''),supplied=Buffer.from(req.headers.get('authorization')?.replace(/^Bearer /,'')||'');
 if(!expected.length||expected.length!==supplied.length||!timingSafeEqual(expected,supplied))return NextResponse.json({error:'Unauthorized'},{status:401});
 const pool=db();try{
  await expireJobs(pool);
  const employers=await pool.query('SELECT id FROM employer_accounts');
  const now=new Date(),period=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-1,1)).toISOString().slice(0,7);
  let processed=0,failed=0;
  for(const employer of employers.rows){
   const client=await pool.connect();try{
    await client.query('BEGIN');
    // Serialize retries and overlapping scheduler calls for this tenant.
    await client.query('SELECT id FROM employer_accounts WHERE id=$1 FOR UPDATE',[employer.id]);
    await client.query(`WITH due AS (UPDATE workforce_employees w SET employment_status='terminated',updated_at=NOW() FROM employee_exits x WHERE x.employee_id=w.id AND x.employer_id=w.employer_id AND x.employer_id=$1 AND x.status='scheduled' AND x.effective_date<=(NOW() AT TIME ZONE 'Africa/Lagos')::date RETURNING w.id,w.employer_id,w.email),
     payroll AS (UPDATE payroll_employees pe SET active=FALSE FROM due WHERE pe.employer_id=due.employer_id AND (pe.workforce_employee_id=due.id OR LOWER(pe.email)=LOWER(due.email))),
     sessions AS (DELETE FROM employee_sessions s USING due WHERE s.employee_id=due.id)
     UPDATE employee_exits x SET status='completed' FROM due WHERE x.employee_id=due.id AND x.employer_id=due.employer_id AND x.status='scheduled' AND x.effective_date<=(NOW() AT TIME ZONE 'Africa/Lagos')::date`,[employer.id]);
    await enrollWorkflows(client,employer.id);
    const existing=await client.query("SELECT 1 FROM workforce_report_snapshots WHERE employer_id=$1 AND period=$2::date AND generated_at>=$2::date+INTERVAL '1 month'",[employer.id,period+'-01']);
    if(!existing.rowCount)await generateMonthlyReport(client,employer.id,period,'month_end');
    await client.query(`INSERT INTO workflow_alerts(employer_id,alert_key,title,details) SELECT w.employer_id,'confirmation:'||w.id||':'||COALESCE(d.review_date,w.hire_date+COALESCE(s.probation_days,90))::text,'Staff confirmation review due',w.first_name||' '||w.last_name||' needs a performance review and HR confirmation decision.' FROM workforce_employees w LEFT JOIN company_workflow_settings s ON s.employer_id=w.employer_id LEFT JOIN LATERAL(SELECT decision,review_date FROM employee_confirmation_decisions c WHERE c.employer_id=w.employer_id AND c.employee_id=w.id ORDER BY c.created_at DESC,c.id DESC LIMIT 1)d ON TRUE WHERE w.employer_id=$1 AND w.employment_status IN ('active','probation') AND COALESCE(d.review_date,w.hire_date+COALESCE(s.probation_days,90))<=CURRENT_DATE AND COALESCE(d.decision,'extended')='extended' ON CONFLICT DO NOTHING`,[employer.id]);
    await client.query('COMMIT');processed++;
   }catch{await client.query('ROLLBACK').catch(()=>{});failed++;}finally{client.release();}
  }
  return NextResponse.json({processed,failed,period},{status:failed?503:200});
 }catch{return NextResponse.json({error:'Workflow scheduler failed'},{status:503});}finally{await pool.end();}
}
