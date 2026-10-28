// Owner-approved single identity only. Existing account IDs are snapshotted so
// later registrations cannot claim this approval.
import pg from 'pg';import {readFileSync} from 'node:fs';
if(!process.env.DATABASE_URL)throw Error('DATABASE_URL is required');
const client=new pg.Client({connectionString:process.env.DATABASE_URL});await client.connect();
try{
 await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(721022)');
 await client.query(readFileSync(new URL('../database/022_support_enrollment.sql',import.meta.url),'utf8'));
 const email=process.env.SUPPORT_INITIAL_AGENT_EMAIL?.trim().toLowerCase();
 if(email){
  const employer=await client.query('SELECT id FROM employer_accounts WHERE company_email=$1',[email]);
  const applicant=employer.rowCount?null:await client.query('SELECT id FROM applicant_accounts WHERE email=$1',[email]);
  const id=employer.rows[0]?.id||applicant?.rows[0]?.id;
  if(id){await client.query('INSERT INTO support_enrollment_approvals(email,account_type,account_id) VALUES($1,$2,$3) ON CONFLICT(email) DO NOTHING',[email,employer.rowCount?'employer':'applicant',id]);console.log('Approved existing owner account for one-time MFA enrollment.');}
  else console.log('No matching existing account. No staff enrollment was approved.');
 }
 await client.query('COMMIT');console.log('Applied 022_support_enrollment.sql');
}catch(e){await client.query('ROLLBACK');throw e;}finally{await client.end();}
