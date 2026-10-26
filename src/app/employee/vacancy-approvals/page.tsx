import Approvals from '@/components/vacancy-approvals';
import {currentEmployee} from '@/lib/employee-auth';
import {db} from '@/lib/employer-session';
export default async function Page(){const employee=await currentEmployee();if(!employee)return null;const p=db();try{const assigned=(await p.query('SELECT 1 FROM company_workflow_settings WHERE employer_id=$1 AND vacancy_approver_employee_id=$2',[employee.employer_id,employee.id])).rowCount;if(!assigned)return <section className="aero-card"><h1 className="text-2xl font-bold">Vacancy approval access</h1><p className="mt-4 text-slate-600">Your organisation has not assigned vacancy approval to your account. Contact your HR administrator if you should manage this queue.</p></section>;return <Approvals/>}finally{await p.end()}}
