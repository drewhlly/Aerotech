export const POLICY_VERSION='2026-11-18.1';
export function acceptsPolicies(b:Record<string,unknown>){return b.acceptedPolicies===true&&b.policyVersion===POLICY_VERSION;}
