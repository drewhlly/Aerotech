import { NextResponse } from 'next/server';
import {submitLeave,LeaveRequestError} from '@/lib/leave-requests';
import { currentEmployee } from '@/lib/employee-auth';
import { db } from '@/lib/employer-session';

export const runtime = 'nodejs';
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
        (SELECT COUNT(DISTINCT d)::int FROM employee_requests r CROSS JOIN LATERAL generate_series(GREATEST(r.start_date,make_date(b.leave_year,1,1))::timestamp,LEAST(r.end_date,make_date(b.leave_year,12,31))::timestamp,interval '1 day') d
         WHERE r.employer_id=b.employer_id AND r.employee_id=b.employee_id AND r.request_type='leave' AND r.leave_category='annual' AND r.status='pending' AND EXTRACT(ISODOW FROM d)<6
         AND NOT EXISTS(SELECT 1 FROM employee_requests a WHERE a.employer_id=b.employer_id AND a.employee_id=b.employee_id AND a.request_type='leave' AND a.leave_category='annual' AND a.status='approved' AND d::date BETWEEN a.start_date AND a.end_date)) AS pending_days,
        EXISTS(SELECT 1 FROM employee_requests r WHERE r.employer_id=b.employer_id AND r.employee_id=b.employee_id AND r.request_type='leave' AND r.leave_category IS NULL AND r.status='approved' AND r.start_date<=make_date(b.leave_year,12,31) AND r.end_date>=make_date(b.leave_year,1,1)) AS has_uncategorised
        FROM employee_leave_balances b WHERE b.employer_id=$1 AND b.employee_id=$2 AND b.leave_year=EXTRACT(YEAR FROM CURRENT_DATE)::int`, [employee.employer_id, employee.id]),
    ]);
    const annual=balance.rows[0];
    return NextResponse.json({ requests: requests.rows, balance: annual ? {...annual,remaining_days:annual.has_uncategorised?null:annual.annual_allowance_days-annual.used_days,available_days:annual.has_uncategorised?null:annual.annual_allowance_days-annual.used_days-annual.pending_days} : null }, { headers });
  } catch { return NextResponse.json({ error: 'Leave information is unavailable.' }, { status: 503, headers }); }
  finally { await pool.end(); }
}

export async function POST(request: Request) {
  const employee = await currentEmployee();
  if (!employee) return NextResponse.json({ error: 'Sign in required.' }, { status: 401, headers });
  let body: { category?: unknown; startDate?: unknown; endDate?: unknown; details?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400, headers }); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid request.' }, { status: 400, headers });
  try {
    const id=await submitLeave(employee.employer_id,employee.id,body);
    return NextResponse.json({id,status:'pending'},{status:201,headers});
  }catch(error){return NextResponse.json({error:error instanceof LeaveRequestError?error.message:'Unable to submit leave request.'},{status:error instanceof LeaveRequestError?error.status:503,headers});}
}
