-- Keep historical migration checksums intact. Recheck under an exclusive lock
-- so an older deployment cannot write payout records between check and drop.
LOCK TABLE payroll_payout_audit, payroll_payout_accounts,
  payroll_transfer_intents, payroll_transfer_recipients IN ACCESS EXCLUSIVE MODE;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM payroll_payout_audit)
     OR EXISTS (SELECT 1 FROM payroll_payout_accounts)
     OR EXISTS (SELECT 1 FROM payroll_transfer_intents)
     OR EXISTS (SELECT 1 FROM payroll_transfer_recipients) THEN
    RAISE EXCEPTION 'Payroll transfer records exist. Back up the tables and obtain approval before removing them.';
  END IF;
END $$;
DROP TABLE payroll_payout_audit, payroll_payout_accounts,
  payroll_transfer_intents, payroll_transfer_recipients;
