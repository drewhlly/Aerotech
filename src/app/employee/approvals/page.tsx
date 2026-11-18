import {forbidden} from 'next/navigation';
import {currentEmployee} from '@/lib/employee-auth';
import {employeeApprovalStages,employeeCanReviewLeave} from '@/lib/employee-approval-access';
import LeaveReview from '@/components/employee-leave-approvals';
import PayrollReview from '@/components/payroll-stage-review';
export default async function MyApprovals(){
 const employee=await currentEmployee();
 if(!employee)forbidden();
 const [stages,canReviewLeave]=await Promise.all([employeeApprovalStages(employee),employeeCanReviewLeave(employee)]);
 if(!stages.length&&!canReviewLeave)forbidden();
 return <div className="space-y-6"><header className="aero-hero"><p className="text-xs font-semibold uppercase tracking-widest text-cyan-200">Assigned responsibilities</p><h1 className="mt-3 text-3xl font-bold">My approvals</h1><p className="mt-3 text-sm leading-6 text-slate-200">Review only the items assigned to you. Decisions are recorded against your account.</p></header>{canReviewLeave&&<LeaveReview/>}{stages.length>0&&<PayrollReview/>}</div>;
}
