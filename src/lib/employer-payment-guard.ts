import { createHash } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { db } from './employer-session';

/**
 * An employer registration may be stored before checkout, but the employer
 * workspace must stay locked until Paystack has verified an unexpired plan.
 * This query only reads the payment state; it never marks an order paid.
 */
export async function employerHasPaidAccess(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('aerotech_employer_session')?.value;
  if (!token) return false;

  const pool = db();
  try {
    const result = await pool.query(
      `SELECT 1
       FROM employer_sessions session
       JOIN company_subscriptions subscription
         ON subscription.employer_id = session.employer_id
       WHERE session.token_hash = $1
         AND session.expires_at > NOW()
         AND subscription.paid_until > NOW()
         AND (subscription.status = 'active' OR (subscription.status = 'demo' AND subscription.reference = 'private-demo-' || session.employer_id::text))
       LIMIT 1`,
      [createHash('sha256').update(token).digest('hex')],
    );
    return (result.rowCount ?? 0) > 0;
  } finally {
    await pool.end();
  }
}
