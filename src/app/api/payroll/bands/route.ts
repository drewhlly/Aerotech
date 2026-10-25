import {NextResponse} from 'next/server';
import {randomUUID} from 'node:crypto';
import {currentEmployer,db} from '@/lib/employer-session';
import {salaryBandInput,salaryBands,syncSalaryBands} from '@/lib/salary-bands';
export async function GET(){const employer=await currentEmployer();if(!employer)return NextResponse.json({error:'HR sign-in required'},{status:401});const p=db();try{const r=await p.query('SELECT band,monthly_gross,basic,housing,transport FROM salary_bands WHERE employer_id=$1',[employer]);return NextResponse.json({bands:r.rows})}finally{await p.end()}}
export async function POST(req:Request){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:'HR sign-in required'},{status:401});
 if(req.headers.get('origin')!==new URL(req.url).origin)return NextResponse.json({error:'Invalid origin'},{status:403});
 let b:Record<string,unknown>;try{b=await req.json();if(!b||typeof b!=='object'||Array.isArray(b))throw Error()}catch{return NextResponse.json({error:'Invalid request'},{status:400})}
 const p=db(),c=await p.connect();try{
 await c.query('BEGIN');await c.query('SELECT id FROM employer_accounts WHERE id=$1 FOR UPDATE',[employer]);
 if(b.action==='configure'){
 const v=salaryBandInput(b);
 await c.query(`INSERT INTO salary_bands(employer_id,band,monthly_gross,basic,housing,transport) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(employer_id,band) DO UPDATE SET monthly_gross=EXCLUDED.monthly_gross,basic=EXCLUDED.basic,housing=EXCLUDED.housing,transport=EXCLUDED.transport,updated_at=NOW()`,[employer,v.band,...v.values]);
 await syncSalaryBands(c,employer);
 }else if(b.action==='assign'){
 if(!salaryBands.includes(b.band as typeof salaryBands[number])||typeof b.employeeId!=='string')throw Error('Choose employee and salary band');
 const band=await c.query('SELECT * FROM salary_bands WHERE employer_id=$1 AND band=$2',[employer,b.band]);if(!band.rowCount)throw Error('Configure this salary band first');
 const e=await c.query("SELECT * FROM workforce_employees WHERE employer_id=$1 AND id=$2 AND employment_status IN ('active','probation','on_leave') FOR UPDATE",[employer,b.employeeId]);if(!e.rowCount)throw Error('Employee not found');const w=e.rows[0],v=band.rows[0];
 const old=await c.query('SELECT id FROM payroll_employees WHERE employer_id=$1 AND (workforce_employee_id=$2 OR (workforce_employee_id IS NULL AND LOWER(email)=LOWER($3))) FOR UPDATE',[employer,w.id,w.email]);if((old.rowCount||0)>1)throw Error('Duplicate payroll identity needs review');
 if(old.rowCount){await c.query('UPDATE payroll_employees SET workforce_employee_id=$2,salary_band=$3,monthly_gross_ngn=$4,basic_salary_ngn=$5,housing_allowance_ngn=$6,transport_allowance_ngn=$7 WHERE employer_id=$1 AND id=$8',[employer,w.id,b.band,v.monthly_gross,v.basic,v.housing,v.transport,old.rows[0].id])}
 else{await c.query(`INSERT INTO payroll_employees(id,employer_id,workforce_employee_id,full_name,email,salary_band,monthly_gross_ngn,basic_salary_ngn,housing_allowance_ngn,transport_allowance_ngn,pension_enabled,active) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,true)`,[randomUUID(),employer,w.id,w.first_name+' '+w.last_name,w.email,b.band,v.monthly_gross,v.basic,v.housing,v.transport])}
 }else throw Error('Unsupported action');
 await c.query('COMMIT');return NextResponse.json({ok:true});
 }catch(e){await c.query('ROLLBACK');return NextResponse.json({error:e instanceof Error?e.message:'Unable to save salary band'},{status:400})}finally{c.release();await p.end()}
}
