import {NextResponse} from 'next/server';
import {currentEmployer,db} from '@/lib/employer-session';
import {sanitizeProfile} from '@/lib/employee-profile-fields';
export const runtime='nodejs';
const day=(v:unknown)=>v?new Date(String(v)).toISOString().slice(0,10):'';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:'Employer sign-in required'},{status:401});
 const {id}=await params,pool=db();try{
  const r=await pool.query('SELECT e.id,e.first_name,e.last_name,e.email,e.phone,e.job_title,e.department,e.date_of_birth,e.hire_date,e.employee_number,e.manager_employee_id,p.details FROM workforce_employees e LEFT JOIN employee_private_profiles p ON p.employee_id=e.id AND p.employer_id=e.employer_id WHERE e.id=$1 AND e.employer_id=$2',[id,employer]);
  const row=r.rows[0];if(!row)return NextResponse.json({error:'Employee not found'},{status:404});
  const details=row.details||{};details.personal={...details.personal,dateOfBirth:day(row.date_of_birth)};details.employment={...details.employment,hireDate:day(row.hire_date),employeeNumber:row.employee_number||'',lineManager:row.manager_employee_id||''};
  return NextResponse.json({employee:{...row,details:undefined},details});
 }catch{return NextResponse.json({error:'Profile unavailable'},{status:503})}finally{await pool.end()}
}
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:'Employer sign-in required'},{status:401});
 const {id}=await params;let incoming;try{incoming=sanitizeProfile(await request.json());for(const value of [incoming.personal?.dateOfBirth,incoming.employment?.hireDate])if(value&&(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))))throw Error()}catch{return NextResponse.json({error:'Invalid profile fields'},{status:400})}
 const pool=db(),c=await pool.connect();try{
  await c.query('BEGIN');const employee=await c.query('SELECT id,employee_number FROM workforce_employees WHERE id=$1 AND employer_id=$2 FOR UPDATE',[id,employer]);if(!employee.rowCount)return NextResponse.json({error:'Employee not found'},{status:404});
  const old=await c.query('SELECT details FROM employee_private_profiles WHERE employee_id=$1 AND employer_id=$2',[id,employer]);const details=old.rows[0]?.details||{};for(const [section,fields]of Object.entries(incoming))details[section]={...details[section],...fields};
  if(incoming.personal&&Object.hasOwn(incoming.personal,'dateOfBirth'))await c.query('UPDATE workforce_employees SET date_of_birth=$1::date,updated_at=NOW() WHERE id=$2 AND employer_id=$3',[incoming.personal.dateOfBirth||null,id,employer]);
  if(incoming.employment){const fields=incoming.employment;
   if(Object.hasOwn(fields,'hireDate'))await c.query('UPDATE workforce_employees SET hire_date=$1::date,updated_at=NOW() WHERE id=$2 AND employer_id=$3',[fields.hireDate||null,id,employer]);
   if(Object.hasOwn(fields,'employeeNumber')){const number=fields.employeeNumber||employee.rows[0].employee_number;if(number&&number.length>64)throw Error('Staff ID must be 64 characters or fewer');if((await c.query('SELECT 1 FROM workforce_employees WHERE employer_id=$1 AND employee_number=$2 AND id<>$3',[employer,number,id])).rowCount)throw Error('This staff ID is already assigned');await c.query('UPDATE workforce_employees SET employee_number=$1 WHERE id=$2 AND employer_id=$3',[number,id,employer]);details.employment.employeeNumber=number}
   if(Object.hasOwn(fields,'lineManager')){let manager=null,name='';if(fields.lineManager){const r=await c.query("SELECT id,first_name,last_name FROM workforce_employees WHERE employer_id=$1 AND id<>$3 AND (id::text=$2 OR LOWER(first_name||' '||last_name)=LOWER($2))",[employer,fields.lineManager,id]);if(r.rowCount!==1)throw Error('Select a line manager from your company');manager=r.rows[0].id;name=r.rows[0].first_name+' '+r.rows[0].last_name}await c.query('UPDATE workforce_employees SET manager_employee_id=$1 WHERE id=$2 AND employer_id=$3',[manager,id,employer]);details.employment.lineManager=name}
  }
  await c.query('INSERT INTO employee_private_profiles(employee_id,employer_id,details) VALUES($1,$2,$3::jsonb) ON CONFLICT(employee_id) DO UPDATE SET details=EXCLUDED.details,updated_at=NOW() WHERE employee_private_profiles.employer_id=EXCLUDED.employer_id',[id,employer,JSON.stringify(details)]);await c.query('COMMIT');return NextResponse.json({ok:true});
 }catch(err){return NextResponse.json({error:err instanceof Error&&/Staff ID|staff ID|line manager/.test(err.message)?err.message:'Unable to save profile fields'},{status:400})}finally{await c.query('ROLLBACK').catch(()=>{});c.release();await pool.end()}
}
