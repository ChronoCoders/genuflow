-- Genuflow Phase 1 — anchor idempotency
--
-- Allow anchor_batches rows to exist in a `pending` state between the moment
-- a transaction is broadcast and the moment it has accumulated enough block
-- confirmations. This lets the poller recover from RPC drops mid-confirmation
-- without re-broadcasting the same calldata.

ALTER TABLE anchor_batches
    ALTER COLUMN block_number DROP NOT NULL;

ALTER TABLE anchor_batches
    ALTER COLUMN tx_hash DROP NOT NULL;

ALTER TABLE anchor_batches
    ADD COLUMN status TEXT NOT NULL DEFAULT 'confirmed';

ALTER TABLE anchor_batches
    ADD CONSTRAINT anchor_batches_status_check
    CHECK (status IN ('pending', 'confirmed'));

-- Pending-row lookup (small subset, indexed predicate)
CREATE INDEX idx_anchor_batches_pending
    ON anchor_batches(records_hash)
    WHERE status = 'pending';
