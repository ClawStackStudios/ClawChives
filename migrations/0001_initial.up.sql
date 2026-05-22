-- 0001_initial.up.sql
-- Baseline consolidated database schema for ClawChives

CREATE TABLE IF NOT EXISTS users (
  uuid       TEXT PRIMARY KEY,
  username   TEXT NOT NULL UNIQUE,
  key_hash   TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_key_hash ON users(key_hash);

CREATE TABLE IF NOT EXISTS api_tokens (
  key        TEXT PRIMARY KEY,
  owner_key  TEXT NOT NULL,
  owner_type TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_api_tokens_key ON api_tokens(key);
CREATE INDEX IF NOT EXISTS idx_api_tokens_expires_at ON api_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_tokens_owner ON api_tokens(owner_key, owner_type);

CREATE TABLE IF NOT EXISTS bookmarks (
  id          TEXT PRIMARY KEY,
  url         TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  favicon     TEXT DEFAULT '',
  tags        TEXT DEFAULT '[]',
  folder_id   TEXT,
  starred     INTEGER DEFAULT 0,
  archived    INTEGER DEFAULT 0,
  color       TEXT,
  jina_url    TEXT DEFAULT NULL,
  user_uuid   TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookmarks_user_url ON bookmarks(user_uuid, url);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_folder_created ON bookmarks(user_uuid, folder_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created ON bookmarks(user_uuid, created_at DESC);

CREATE TABLE IF NOT EXISTS folders (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  parent_id  TEXT,
  color      TEXT DEFAULT '#06b6d4',
  user_uuid  TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_folders_user ON folders(user_uuid);

CREATE TABLE IF NOT EXISTS agent_keys (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  description     TEXT,
  api_key         TEXT NOT NULL UNIQUE,
  permissions     TEXT NOT NULL,
  expiration_type TEXT NOT NULL,
  expiration_date TEXT,
  rate_limit      INTEGER,
  is_active       INTEGER DEFAULT 1,
  user_uuid       TEXT NOT NULL DEFAULT '',
  revoked_at      TEXT,
  revoked_by      TEXT,
  revoke_reason   TEXT,
  created_at      TEXT NOT NULL,
  last_used       TEXT
);

CREATE INDEX IF NOT EXISTS idx_agent_keys_api_key ON agent_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_agent_keys_active ON agent_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_agent_keys_user ON agent_keys(user_uuid);

CREATE TABLE IF NOT EXISTS jina_conversions (
  bookmark_id TEXT PRIMARY KEY,
  user_uuid   TEXT NOT NULL,
  url         TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  FOREIGN KEY(bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_jina_conversions_user ON jina_conversions(user_uuid);

CREATE TABLE IF NOT EXISTS settings (
  key       TEXT PRIMARY KEY,
  value     TEXT NOT NULL,
  user_uuid TEXT NOT NULL DEFAULT ''
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_user_key ON settings(user_uuid, key);

CREATE TABLE IF NOT EXISTS system_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT OR IGNORE INTO system_settings (key, value, updated_at) 
  VALUES ('audit_retention_days', '90', datetime('now'));
INSERT OR IGNORE INTO system_settings (key, value, updated_at) 
  VALUES ('uptime_retention_days', '30', datetime('now'));

CREATE TABLE IF NOT EXISTS import_sessions (
  id          TEXT PRIMARY KEY,
  user_uuid   TEXT NOT NULL,
  key_id      TEXT NOT NULL,
  started_at  TEXT NOT NULL,
  closed_at   TEXT,
  error_count INTEGER DEFAULT 0,
  errors_json TEXT DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_import_sessions_user ON import_sessions(user_uuid);
