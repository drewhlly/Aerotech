import assert from 'node:assert/strict';
import {mock} from 'node:test';
import {PGlite} from '@electric-sql/pglite';

const database = await PGlite.create();
const employerId = '11111111-1111-4111-8111-111111111111';
const otherEmployerId = '22222222-2222-4222-8222-222222222222';
const runId = '33333333-3333-4333-8333-333333333333';
let employer = null;
const query = async (sql, params) => {
  const result = await database.query(sql, params);
  return {...result, rowCount:result.rows.length};
};
mock.module(new URL('../src/lib/employer-session.ts', import.meta.url).href, {namedExports:{
  currentEmployer:async () => employer, db:() => ({query, end:async () => {}}),
}});
const {GET, POST} = await import('../src/app/api/payroll/bank-schedule/route.ts');
const endpoint = 'https://local.test/api/payroll/bank-schedule';
const download = () => GET(new Request(endpoint + '?runId=' + runId));
const record = (origin = 'https://local.test') => POST(new Request(endpoint, {
  method:'POST', headers:{origin, host:'local.test'},
  body:new URLSearchParams({runId, paidOn:'2026-01-30', reference:'BANK-123'}),
}));
try {
  await database.exec(`
    CREATE TABLE payroll_runs(id uuid PRIMARY KEY, employer_id uuid, status text);
    CREATE VIEW payable_payroll_runs AS SELECT * FROM payroll_runs WHERE status='approved';
    CREATE TABLE payroll_run_items(run_id uuid, employee_id uuid, net numeric);
    CREATE TABLE payroll_employees(id uuid, employer_id uuid, workforce_employee_id uuid);
    CREATE TABLE employee_private_profiles(employee_id uuid, employer_id uuid, details jsonb);
    CREATE TABLE payroll_payment_records(run_id uuid PRIMARY KEY, paid_on date, payment_reference text);
    CREATE TABLE payroll_bank_schedule_access(run_id uuid);
  `);
  await query("INSERT INTO payroll_runs VALUES($1,$2,'awaiting_hr')", [runId,employerId]);
  await query('INSERT INTO payroll_employees VALUES($1,$2,$1)', [runId,employerId]);
  await query('INSERT INTO payroll_run_items VALUES($1,$1,75000)', [runId]);
  await query('INSERT INTO employee_private_profiles VALUES($1,$2,$3)', [runId,employerId,
    {banking:{bankName:'Fixture Bank',accountName:'=Example',accountNumber:'0123456789'}}]);
  assert.equal((await download()).status, 401);
  employer = employerId;
  assert.equal((await download()).status, 404);
  await query("UPDATE payroll_runs SET status='approved' WHERE id=$1", [runId]);
  employer = otherEmployerId;
  assert.equal((await download()).status, 404);
  assert.equal((await record()).status, 409);
  employer = employerId;
  const response = await download();
  assert.equal(response.status, 200);
  assert.match(await response.text(), /"0123456789","'=Example","75000"/);
  assert.equal((await query('SELECT * FROM payroll_bank_schedule_access')).rowCount, 1);
  assert.equal((await record('https://foreign.test')).status, 403);
  assert.equal((await record()).status, 303);
  assert.equal((await record()).status, 409);
} finally { await database.close(); }
