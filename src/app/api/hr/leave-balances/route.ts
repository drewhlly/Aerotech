import { NextResponse } from 'next/server';
import { currentEmployer, db } from '@/lib/employer-session';
export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'private, no-store' };
export async function GET() {
 const employer = await currentEmployer(); if (!employer) return NextResponse.json({error:'Sign in required.'},{status:401,headers});
 const pool=db(); try { const r=await pool.query(`SELECT e.id,e.first_name,e.last_name,b.leave_year,b.annual_allowance_days FROM workforce_employees e LEFT JOIN employee_leave_balances b ON b.employee_id=e.id AND b.employer_id=e.employer_id AND b.leave_year=EXTRACT(YEAR FROM CURRENT_DATE)::int WHERE e.employer_id=$1 AND e.employment_status IN ('active','probation','on_leave') ORDER BY e.first_name,e.last_name`,[employer]);return NextResponse.json({employees:r.rows},{headers}); } catch {return NextResponse.json({error:'Unable to load leave allowances.'},{status:503,headers});} finally {await pool.end();}
}
export async function POST(request:Request) {
 const employer=await currentEmployer(); if(!employer)return NextResponse.json({error:'Sign in required.'},{status:401,headers});
 let body:{employeeId?:unknown;days?:unknown};try{body=await request.json()}catch{return NextResponse.json({error:'Invalid request.'},{status:400,headers})}
 if(typeof body.employeeId!=='string'||typeof body.days!=='number'||!Number.isInteger(body.days)||body.days<0||body.days>366)return NextResponse.json({error:'Choose an employee and enter an allowance from 0 to 366 days.'},{status:400,headers});
 const pool=db();try{const r=await pool.query(`INSERT INTO employee_leave_balances(employer_id,employee_id,leave_year,annual_allowance_days) SELECT employer_id,id,EXTRACT(YEAR FROM CURRENT_DATE)::int,$3 FROM workforce_employees WHERE employer_id=$1 AND id=$2 AND employment_status IN ('active','probation','on_leave') ON CONFLICT(employer_id,employee_id,leave_year) DO UPDATE SET annual_allowance_days=EXCLUDED.annual_allowance_days RETURNING employee_id`,[employer,body.employeeId,body.days]);if(!r.rowCount)return NextResponse.json({error:'Employee not found.'},{status:404,headers});return NextResponse.json({ok:true},{headers});}catch{return NextResponse.json({error:'Unable to save allowance.'},{status:503,headers});}finally{await pool.end();}
}
