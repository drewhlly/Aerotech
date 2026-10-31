import {employeeLeaveBalances} from '@/lib/leave-calculations';
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
    const year=new Date().getUTCFullYear();
    const [requests,advanced,calendar]=await Promise.all([
     pool.query("SELECT id,leave_category,start_date,end_date,status,details,review_note FROM employee_requests WHERE employer_id=$1 AND employee_id=$2 AND request_type='leave' ORDER BY created_at DESC LIMIT 100",[employee.employer_id,employee.id]),employeeLeaveBalances(pool,employee.employer_id,employee.id,year),
     pool.query("SELECT r.id,r.start_date,r.end_date,e.first_name,e.last_name FROM employee_requests r JOIN workforce_employees e ON e.id=r.employee_id AND e.employer_id=r.employer_id WHERE r.employer_id=$1 AND r.request_type='leave' AND r.status='approved' AND (e.id=$2 OR e.manager_employee_id=$2) AND r.end_date>=CURRENT_DATE AND r.start_date<=CURRENT_DATE+90 ORDER BY r.start_date,r.id LIMIT 100",[employee.employer_id,employee.id])]);
    const annual=advanced.balances[0];
    return NextResponse.json({requests:requests.rows,calendar:calendar.rows,policy:advanced.policy,balances:advanced.balances,balance:annual.configured?{...annual,annual_allowance_days:annual.allowance,leave_year:year}:null},{headers});
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
