import Link from 'next/link';

export default function PaySchedule() {
  return <section className="aero-card space-y-4">
    <h1 className="text-3xl font-bold">Pay schedule</h1>
    <p>Review approved payroll and pay employees through your company bank.</p>
    <Link href="/dashboard/employer/payroll/payslips" className="aero-button border">View payroll statements</Link>
  </section>;
}
