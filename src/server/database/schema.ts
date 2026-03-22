import { Database } from 'better-sqlite3-multiple-ciphers';

export function initializeSchema(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      uuid       TEXT PRIMARY KEY,
      username   TEXT NOT NULL UNIQUE,
      key_hash   TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS api_tokens (
      key        TEXT PRIMARY KEY,
      owner_key  TEXT NOT NULL,
      owner_type TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

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
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS folders (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      parent_id  TEXT,
      color      TEXT DEFAULT '#06b6d4',
      created_at TEXT NOT NULL
    );

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
      created_at      TEXT NOT NULL,
      last_used       TEXT
    );

    CREATE TABLE IF NOT EXISTS jina_conversions (
      bookmark_id TEXT PRIMARY KEY,
      user_uuid   TEXT NOT NULL,
      url         TEXT NOT NULL,
      created_at  TEXT NOT NULL,
      FOREIGN KEY(bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp   TEXT NOT NULL,
      event_type  TEXT NOT NULL,
      actor       TEXT,
      actor_type  TEXT,
      resource    TEXT,
      action      TEXT NOT NULL,
      outcome     TEXT NOT NULL,
      ip_address  TEXT,
      user_agent  TEXT,
      details     TEXT
    );

    CREATE TABLE IF NOT EXISTS import_sessions (
      id          TEXT PRIMARY KEY,
      user_uuid   TEXT NOT NULL,
      key_id      TEXT NOT NULL,
      started_at  TEXT NOT NULL,
      closed_at   TEXT,
      error_count INTEGER DEFAULT 0,
      errors_json TEXT DEFAULT '[]'
    );
  `);
}
