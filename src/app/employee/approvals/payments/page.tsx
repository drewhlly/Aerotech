import {forbidden} from 'next/navigation';
import {currentEmployee} from '@/lib/employee-auth';
import {employeeApprovalStages} from '@/lib/employee-approval-access';
import PayrollPayments from '@/components/payroll-payments';
export default async function PaymentAuthorisations(){
 const employee=await currentEmployee();
 if(!employee||!(await employeeApprovalStages(employee)).includes('ceo'))forbidden();
 return <PayrollPayments/>;
}
