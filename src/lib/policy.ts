export const POLICY_VERSION='2026-10-27.1';
export function acceptsPolicies(b:Record<string,unknown>){return b.acceptedPolicies===true&&b.policyVersion===POLICY_VERSION;}
