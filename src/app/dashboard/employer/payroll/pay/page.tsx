import {currentEmployer, db} from '@/lib/employer-session';
import {forbidden} from 'next/navigation';

export default async function PaySchedule() {
  const employer = await currentEmployer();
  if (!employer) forbidden();
  const pool = db();
  const runs = await pool.query<{id:string; month:string; paid_on:string|null}>(`
    SELECT r.id, to_char(r.payroll_month,'YYYY-MM') AS month, p.paid_on::text
    FROM payable_payroll_runs r LEFT JOIN payroll_payment_records p ON p.run_id=r.id
    WHERE r.employer_id=$1 ORDER BY r.payroll_month DESC LIMIT 24
  `, [employer]).finally(() => pool.end());
  return <section className="aero-card space-y-4">
    <h1 className="text-3xl font-bold">Pay schedule</h1>
    <p>Download an approved schedule and pay employees through your company bank. Record the payment after it clears.</p>
    {runs.rows.length === 0 && <p>No approved runs are ready for payment.</p>}
    {runs.rows.map(run => <section key={run.id} className="rounded-lg border p-4 space-y-3">
      <h2 className="font-bold">{run.month}</h2>
      <a className="aero-button border" href={`/api/payroll/bank-schedule?runId=${run.id}`}>Download schedule CSV</a>
      {run.paid_on ? <p>Paid on {run.paid_on}</p> :
        <form method="post" action="/api/payroll/bank-schedule" className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="runId" value={run.id} />
          <label className="grid gap-1">Payment date<input className="rounded border p-2" name="paidOn" type="date" required /></label>
          <label className="grid gap-1">Bank reference<input className="rounded border p-2" name="reference" required maxLength={100} /></label>
          <button className="aero-button border" type="submit">Mark as paid</button>
        </form>}
    </section>)}
  </section>;
}
