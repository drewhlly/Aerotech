import {NextResponse} from 'next/server';
import {sameOrigin} from '@/lib/collaboration-policy';
import {currentEmployer, db} from '@/lib/employer-session';

export const runtime = 'nodejs';

const validRunId = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value);

function csvField(value: string) {
  const safe = /^[\s]*[=+@-]|^[\t\r\n]/.test(value) ? "'" + value : value;
  return '"' + safe.replaceAll('"', '""') + '"';
}

export async function GET(request: Request) {
  const employer = await currentEmployer();
  if (!employer) return new Response(null, {status:401});
  const runId = new URL(request.url).searchParams.get('runId');
  if (!validRunId(runId)) return new Response(null, {status:400});
  const pool = db();
  try {
    const {rows} = await pool.query<{
      bank_name:string|null; account_number:string|null; account_name:string|null; net:string;
    }>(`
      SELECT b.details->'banking'->>'bankName' AS bank_name,
        b.details->'banking'->>'accountNumber' AS account_number,
        b.details->'banking'->>'accountName' AS account_name, i.net
      FROM payable_payroll_runs r
      JOIN payroll_run_items i ON i.run_id=r.id
      JOIN payroll_employees p ON p.id=i.employee_id AND p.employer_id=r.employer_id
      LEFT JOIN employee_private_profiles b ON b.employee_id=p.workforce_employee_id AND b.employer_id=p.employer_id
      WHERE r.id=$1 AND r.employer_id=$2 AND i.net>0 ORDER BY p.id
    `, [runId, employer]);
    if (!rows.length) return new Response(null, {status:404});
    const accounts = new Set<string>();
    for (const row of rows) {
      if (!row.bank_name?.trim() || !row.account_name?.trim() || !/^\d{10}$/.test(row.account_number ?? '')) {
        return NextResponse.json({error:'Complete the bank details for every employee on the schedule.'}, {status:422});
      }
      const key = row.bank_name.trim().toLowerCase() + '/' + row.account_number;
      if (accounts.has(key)) return NextResponse.json({error:'Resolve duplicate bank accounts before exporting.'}, {status:422});
      accounts.add(key);
    }
    const csv = [['Bank name','Account number','Account name','Amount (NGN)'], ...rows.map(row =>
      [row.bank_name!,row.account_number!,row.account_name!,row.net])].map(row => row.map(csvField).join(',')).join('\r\n');
    await pool.query('INSERT INTO payroll_bank_schedule_access(run_id) VALUES($1)', [runId]);
    return new Response(csv, {headers:{'Content-Type':'text/csv; charset=utf-8',
      'Content-Disposition':'attachment; filename="pay-schedule.csv"', 'Cache-Control':'private, no-store'}});
  } catch {
    return NextResponse.json({error:'Pay schedule unavailable'}, {status:503});
  } finally { await pool.end(); }
}

export async function POST(request: Request) {
  if (!sameOrigin(request.headers.get('origin') ?? '', request.headers.get('host'), new URL(request.url).protocol)) {
    return new Response(null, {status:403});
  }
  const employer = await currentEmployer();
  if (!employer) return new Response(null, {status:401});
  const form = await request.formData().catch(() => null);
  const runId = form?.get('runId');
  const date = form?.get('paidOn');
  const reference = form?.get('reference');
  if (!validRunId(runId) || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      typeof reference !== 'string' || !reference.trim() || reference.trim().length > 100) {
    return NextResponse.json({error:'Enter a payment date and bank reference'}, {status:400});
  }
  const pool = db();
  try {
    const result = await pool.query(`
      INSERT INTO payroll_payment_records(run_id, paid_on, payment_reference)
      SELECT id, $3::date, $4 FROM payable_payroll_runs WHERE id=$1 AND employer_id=$2
      ON CONFLICT (run_id) DO NOTHING RETURNING run_id
    `, [runId, employer, date, reference.trim()]);
    if (!result.rowCount) return NextResponse.json({error:'Run unavailable or already recorded as paid'}, {status:409});
    return NextResponse.redirect(new URL('/dashboard/employer/payroll/pay', request.url), 303);
  } catch {
    return NextResponse.json({error:'Unable to record payment. Check the date and retry.'}, {status:422});
  } finally { await pool.end(); }
}
