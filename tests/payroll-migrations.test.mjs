import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';

const migration = (name) => readFileSync(new URL('../database/' + name, import.meta.url), 'utf8');

test('transfer cleanup refuses to drop a populated table and removes empty tables', async () => {
  const db = new PGlite();
  try {
    await db.exec(`CREATE TABLE payroll_payout_audit(id int);
      CREATE TABLE payroll_payout_accounts(id int);
      CREATE TABLE payroll_transfer_intents(id int);
      CREATE TABLE payroll_transfer_recipients(id int);
      INSERT INTO payroll_transfer_intents VALUES (1)`);
    const cleanup = migration('047_remove_payroll_transfers.sql');
    await assert.rejects(db.transaction(tx => tx.exec(cleanup)), /Payroll transfer records exist/);
    assert.equal((await db.query('SELECT id FROM payroll_transfer_intents')).rows[0].id, 1);
    await db.exec('DELETE FROM payroll_transfer_intents');
    await db.transaction(tx => tx.exec(cleanup));
    assert.equal((await db.query("SELECT to_regclass('payroll_payout_accounts') AS name")).rows[0].name, null);
  } finally { await db.close(); }
});

test('approved and manually paid runs cannot be edited', async () => {
  const db = new PGlite();
  const run = '11111111-1111-4111-8111-111111111111';
  try {
    await db.exec(`CREATE TABLE payroll_runs(id uuid PRIMARY KEY, employer_id int,
      payroll_month date, status text, UNIQUE(employer_id,payroll_month));
      CREATE TABLE payroll_run_items(run_id uuid REFERENCES payroll_runs(id), net numeric)`);
    await db.exec(migration('049_payroll_bank_schedule.sql'));
    await db.query("INSERT INTO payroll_runs VALUES($1,1,'2026-01-01','awaiting_hr')", [run]);
    await db.query('INSERT INTO payroll_run_items VALUES($1,100)', [run]);
    await assert.rejects(db.exec("INSERT INTO payroll_runs VALUES(gen_random_uuid(),1,'2026-01-01','awaiting_hr')"), /duplicate key/);
    await db.query("UPDATE payroll_runs SET status='approved' WHERE id=$1", [run]);
    await assert.rejects(db.query('UPDATE payroll_run_items SET net=200 WHERE run_id=$1', [run]), /immutable/);
    await db.query("INSERT INTO payroll_payment_records(run_id,paid_on,payment_reference) VALUES($1,'2026-01-30','REF')", [run]);
    await assert.rejects(db.query("UPDATE payroll_runs SET status='awaiting_hr' WHERE id=$1", [run]), /immutable/);
  } finally { await db.close(); }
});
