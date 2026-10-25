import {randomUUID} from 'node:crypto';
import type {PoolClient} from 'pg';
import {sanitizeProfile} from './employee-profile-fields';
export async function createEmployee(c:PoolClient,employer:string,b:Record<string,unknown>){
 for(const k of ['firstName','lastName','email','jobTitle','department'])if(typeof b[k]!=='string'||!String(b[k]).trim()||String(b[k]).length>255)throw Error('Complete '+k);
 const email=String(b.email).trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Invalid email');
 const details=sanitizeProfile(b.details||{});
 for(const [section,field] of [['personal','nin'],['banking','bvn']] as const){const v=details[section]?.[field];if(v&&!/^\d{11}$/.test(v))throw Error(field.toUpperCase()+' must contain 11 digits');}
 const dob=details.personal?.dateOfBirth||b.dateOfBirth||null;const hire=details.employment?.hireDate||b.hireDate||new Date().toISOString().slice(0,10);
 for(const d of [dob,hire])if(d&&(!/^\d{4}-\d{2}-\d{2}$/.test(String(d))||!Number.isFinite(Date.parse(String(d)))))throw Error('Invalid date');
 let manager:string|null=null;let managerName='';
 if(b.managerEmployeeId||b.managerEmail){const found=await c.query('SELECT id,first_name,last_name FROM workforce_employees WHERE employer_id=$1 AND (id::text=$2 OR LOWER(email)=$3)',[employer,String(b.managerEmployeeId||''),String(b.managerEmail||'').toLowerCase()]);if(!found.rowCount)throw Error('Line manager must be an existing employee in your company');manager=found.rows[0].id;managerName=found.rows[0].first_name+' '+found.rows[0].last_name;}
 details.employment={...details.employment,hireDate:String(hire),lineManager:managerName||details.employment?.lineManager||''};
 const id=randomUUID();details.employment.employeeNumber=details.employment.employeeNumber||'AT-'+id.replaceAll('-','').slice(0,12).toUpperCase();await c.query("INSERT INTO workforce_employees(id,employer_id,first_name,last_name,email,phone,job_title,department,location,employment_status,date_of_birth,hire_date,manager_employee_id,employee_number) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'active',$10::date,$11::date,$12,$13)",[id,employer,String(b.firstName).trim(),String(b.lastName).trim(),email,String(b.phone||''),String(b.jobTitle).trim(),String(b.department).trim(),String(b.location||details.employment.workLocation||''),dob,hire,manager,details.employment.employeeNumber||null]);
 await c.query('INSERT INTO employee_private_profiles(employee_id,employer_id,details) VALUES($1,$2,$3::jsonb)',[id,employer,JSON.stringify(details)]);return id;
}
