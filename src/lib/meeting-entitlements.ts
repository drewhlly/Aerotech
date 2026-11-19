import type { PoolClient } from "pg";
import { AccessError } from "./collaboration";
import { builtInConfiguration } from "./meeting-runtime-config";
export async function meetingEntitlement(
  c: PoolClient,
  tenant: string,
  month = new Date().toISOString().slice(0, 7) + "-01",
) {
  const r = (
    await c.query(
      `SELECT s.plan,s.status,s.paid_until,l.built_in_enabled,l.monthly_minutes,l.max_participants FROM employer_accounts a LEFT JOIN company_subscriptions s ON s.employer_id=a.id LEFT JOIN meeting_plan_limits l ON l.plan=s.plan WHERE a.id=$1`,
      [tenant],
    )
  ).rows[0];
  const usage = (
    await c.query(
      "SELECT participant_minutes,audio_minutes FROM employer_meeting_usage WHERE employer_id=$1 AND month=$2",
      [tenant, month],
    )
  ).rows[0];
  const reserved = Number(
    (
      await c.query(
        "SELECT COALESCE(sum(participant_minutes),0) n FROM employer_meeting_reservations WHERE employer_id=$1 AND month=$2 AND released_at IS NULL",
        [tenant, month],
      )
    ).rows[0].n,
  );
  const active =
      r?.status === "active" && new Date(r.paid_until).getTime() > Date.now(),
    quota = active ? Number(r?.monthly_minutes || 0) : 0,
    used = Number(usage?.participant_minutes || 0),
    config = builtInConfiguration();
  return {
    plan: r?.plan || "basic",
    enabled: Boolean(active && r?.built_in_enabled && config.enabled),
    configured: config.enabled,
    configurationMessage: config.error,
    quota,
    used,
    audioMinutes: Number(usage?.audio_minutes || 0),
    reserved,
    remaining: Math.max(0, quota - used - reserved),
    warning: quota > 0 && used >= quota * 0.8,
    maxParticipants: Number(r?.max_participants || 8),
    month,
  };
}
export async function requireBuiltIn(
  c: PoolClient,
  tenant: string,
  month?: string,
) {
  const e = await meetingEntitlement(c, tenant, month);
  if (!e.configured)
    throw new AccessError(
      e.configurationMessage ||
        "Built-in meetings unavailable. Use external link mode.",
      503,
    );
  if (!e.enabled)
    throw new AccessError(
      "Your active plan does not include built-in meetings. Upgrade or use external link mode.",
      403,
    );
  if (e.used >= e.quota)
    throw new AccessError(
      "Your monthly built-in meeting quota is exhausted. Use external link mode or upgrade your plan.",
      429,
    );
  return e;
}
