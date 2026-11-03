-- Only read receipts are stored. Notifications are derived from live authorized
-- business records; a receipt neither changes those records nor sends a message.
CREATE TABLE workspace_notification_receipts (
 principal_id TEXT NOT NULL,
 notification_id TEXT NOT NULL CHECK(length(notification_id) BETWEEN 1 AND 400),
 read_at TEXT NOT NULL,
 PRIMARY KEY(principal_id,notification_id)
);
CREATE INDEX idx_workspace_notification_receipts_principal ON workspace_notification_receipts(principal_id,read_at DESC);
