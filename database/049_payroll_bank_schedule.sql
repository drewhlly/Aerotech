CREATE TABLE payroll_payment_records (
  run_id uuid PRIMARY KEY REFERENCES payroll_runs(id),
  paid_on date NOT NULL,
  payment_reference text NOT NULL CHECK (length(payment_reference) BETWEEN 1 AND 100),
  recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE payroll_bank_schedule_access (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  run_id uuid NOT NULL REFERENCES payroll_runs(id),
  accessed_at timestamptz NOT NULL DEFAULT now()
);

CREATE FUNCTION prevent_approved_payroll_edits() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE run_status text;
BEGIN
  IF TG_TABLE_NAME = 'payroll_runs' THEN
    IF OLD.status = 'approved' THEN
      RAISE EXCEPTION 'Approved payroll is immutable';
    END IF;
  ELSE
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
      SELECT status INTO run_status FROM payroll_runs WHERE id = OLD.run_id FOR SHARE;
      IF run_status = 'approved' THEN RAISE EXCEPTION 'Approved payroll items are immutable'; END IF;
    END IF;
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
      SELECT status INTO run_status FROM payroll_runs WHERE id = NEW.run_id FOR SHARE;
      IF run_status = 'approved' THEN RAISE EXCEPTION 'Approved payroll items are immutable'; END IF;
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER lock_approved_payroll_run BEFORE UPDATE OR DELETE ON payroll_runs
FOR EACH ROW EXECUTE FUNCTION prevent_approved_payroll_edits();
CREATE TRIGGER lock_approved_payroll_items BEFORE INSERT OR UPDATE OR DELETE ON payroll_run_items
FOR EACH ROW EXECUTE FUNCTION prevent_approved_payroll_edits();
