-- Run this once against your database before restarting the backend with
-- the updated model. create_all() only creates missing TABLES, not missing
-- COLUMNS on a table that already exists, and Postgres native enums need
-- an explicit ALTER TYPE to add new values.

-- 1. New AccountType values.
-- Note: adding enum values is transaction-safe on Postgres 12+. If you're
-- on an older Postgres, run each ALTER TYPE statement on its own,
-- separately committed.
ALTER TYPE accounttype ADD VALUE IF NOT EXISTS 'salary';
ALTER TYPE accounttype ADD VALUE IF NOT EXISTS 'fixed_deposit';

-- 2. New columns on accounts. All nullable, so existing rows are
-- unaffected (they'll just have NULL for all of these).
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS credit_limit FLOAT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS billing_cycle_day INTEGER;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS due_date_days_after_billing INTEGER;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS is_secured_by_fd BOOLEAN;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS interest_rate FLOAT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS maturity_date TIMESTAMP;

-- Sanity check afterwards:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'accounts';
-- SELECT enum_range(NULL::accounttype);