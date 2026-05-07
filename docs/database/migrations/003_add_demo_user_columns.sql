-- Add demo user support
ALTER TABLE users ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN demo_expires_at DATETIME;

CREATE INDEX IF NOT EXISTS idx_users_is_demo_expires_at
ON users (is_demo, demo_expires_at);
