import { forbidden } from 'next/navigation';
import FaceReview from '@/components/face/face-review';
import { currentEmployee } from '@/lib/employee-auth';
import { db } from '@/lib/employer-session';

export const runtime = 'nodejs';
export default async function Page() {
  const employee = await currentEmployee();
  if (!employee) forbidden();
  const pool = db();
  let manager = false;
  try {
    // Match face-service actor(): an assigned direct report in the same tenant.
    const reports = await pool.query(
      'SELECT 1 FROM workforce_employees WHERE employer_id=$1 AND manager_employee_id=$2 AND id<>$2 LIMIT 1',
      [employee.employer_id, employee.id],
    );
    manager = Boolean(reports.rowCount);
  } finally {
    await pool.end();
  }
  if (!manager) forbidden();
  return <FaceReview/>;
}
