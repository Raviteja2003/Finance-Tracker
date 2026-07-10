
DELETE FROM transactions;
ALTER TABLE transactions ALTER COLUMN category_id SET NOT NULL;