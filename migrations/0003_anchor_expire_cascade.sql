-- Genuflow Phase 1 — anchor expiry by deletion
--
-- When a pending anchor batch is expired (broadcast dropped from mempool,
-- no receipt before the TTL), the row is now deleted outright rather than
-- left as a tx_hash=NULL sentinel. Re-point the events FK so the delete
-- cascades to NULL on `provenance_events.anchor_batch_id`, freeing the
-- attached events to be picked up by `list_unanchored` on the next tick.

ALTER TABLE provenance_events
    DROP CONSTRAINT provenance_events_anchor_batch_id_fkey;

ALTER TABLE provenance_events
    ADD CONSTRAINT provenance_events_anchor_batch_id_fkey
    FOREIGN KEY (anchor_batch_id)
    REFERENCES anchor_batches(id)
    ON DELETE SET NULL;
