import {forbidden,redirect} from 'next/navigation';
import {currentEmployee} from '@/lib/employee-auth';
import {employeeApprovalStages} from '@/lib/employee-approval-access';
export default async function LegacyPaymentAuthorisations(){
 const employee=await currentEmployee();
 if(!employee||!(await employeeApprovalStages(employee)).includes('ceo'))forbidden();
 redirect('/employee/approvals/payments');
}
