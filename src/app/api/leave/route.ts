import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { currentEmployee } from '@/lib/employee-auth';
import { db } from '@/lib/employer-session';

export const runtime = 'nodejs';
const categories = ['annual', 'sick', 'maternity', 'paternity', 'compassionate', 'study', 'unpaid', 'other'];
const headers = { 'Cache-Control': 'private, no-store' };

export async function GET() {
  const employee = await currentEmployee();
  if (!employee) return NextResponse.json({ error: 'Sign in required.' }, { status: 401, headers });
  const pool = db();
  try {
    const [requests, balance] = await Promise.all([
      pool.query("SELECT id,leave_category,start_date,end_date,status,details,review_note FROM employee_requests WHERE employer_id=$1 AND employee_id=$2 AND request_type='leave' ORDER BY created_at DESC LIMIT 100", [employee.employer_id, employee.id]),
      pool.query(`SELECT b.leave_year, b.annual_allowance_days,
        (SELECT COUNT(DISTINCT d)::int FROM employee_requests r CROSS JOIN LATERAL generate_series(GREATEST(r.start_date,make_date(b.leave_year,1,1))::timestamp,LEAST(r.end_date,make_date(b.leave_year,12,31))::timestamp,interval '1 day') d
         WHERE r.employer_id=b.employer_id AND r.employee_id=b.employee_id AND r.request_type='leave' AND r.leave_category='annual' AND r.status='approved' AND EXTRACT(ISODOW FROM d)<6) AS used_days,
        EXISTS(SELECT 1 FROM employee_requests r WHERE r.employer_id=b.employer_id AND r.employee_id=b.employee_id AND r.request_type='leave' AND r.leave_category IS NULL AND r.status='approved' AND r.start_date<=make_date(b.leave_year,12,31) AND r.end_date>=make_date(b.leave_year,1,1)) AS has_uncategorised
        FROM employee_leave_balances b WHERE b.employer_id=$1 AND b.employee_id=$2 AND b.leave_year=EXTRACT(YEAR FROM CURRENT_DATE)::int`, [employee.employer_id, employee.id]),
    ]);
    return NextResponse.json({ requests: requests.rows, balance: balance.rows[0] || null }, { headers });
  } catch { return NextResponse.json({ error: 'Leave information is unavailable.' }, { status: 503, headers }); }
  finally { await pool.end(); }
}

export async function POST(request: Request) {
  const employee = await currentEmployee();
  if (!employee) return NextResponse.json({ error: 'Sign in required.' }, { status: 401, headers });
  let body: { category?: unknown; startDate?: unknown; endDate?: unknown; details?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400, headers }); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid request.' }, { status: 400, headers });
  const validDate = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v+'T00:00:00Z')) && new Date(v+'T00:00:00Z').toISOString().slice(0,10) === v;
  if (typeof body.category !== 'string' || !categories.includes(body.category) || !validDate(body.startDate) || !validDate(body.endDate) || body.startDate > body.endDate || typeof body.details !== 'string' || !body.details.trim() || body.details.length > 2000) return NextResponse.json({ error: 'Choose a leave type and provide valid dates and a reason.' }, { status: 400, headers });
  if (!employee.manager_employee_id) return NextResponse.json({ error: 'No line manager is assigned. Contact HR.' }, { status: 422, headers });
  const pool = db();
  try {
    const result = await pool.query("INSERT INTO employee_requests(id,employer_id,employee_id,request_type,leave_category,start_date,end_date,details) VALUES($1,$2,$3,'leave',$4,$5::date,$6::date,$7) RETURNING id", [randomUUID(),employee.employer_id,employee.id,body.category,body.startDate,body.endDate,body.details.trim()]);
    return NextResponse.json({ id: result.rows[0].id }, { status: 201, headers });
  } catch { return NextResponse.json({ error: 'Unable to submit leave request.' }, { status: 503, headers }); }
  finally { await pool.end(); }
}
