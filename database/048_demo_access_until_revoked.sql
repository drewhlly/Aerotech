-- Explicit tenant-bound demos are internal grants, not paid subscriptions.
-- Revoke access by changing status to expired or clearing the private-demo reference.
-- paid_until continues to enforce expiry for active paid subscriptions only.
COMMENT ON COLUMN company_subscriptions.status IS
  'active: provider-verified paid plan with future paid_until; expired: no access; demo: explicit tenant-bound internal access until revoked, not a payment';
