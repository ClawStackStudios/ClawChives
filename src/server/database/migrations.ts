import { Database } from 'better-sqlite3-multiple-ciphers';

export function runMigrations(db: Database) {
  const runColumnMigration = (sql: string, desc: string) => {
    try { db.exec(sql); console.log(`[DB Migration] ✅  ${desc}`); }
    catch (e: any) { if (!e.message.includes('duplicate column')) throw e; }
  };

  runColumnMigration("ALTER TABLE bookmarks ADD COLUMN user_uuid TEXT NOT NULL DEFAULT ''", 'bookmarks.user_uuid');
  runColumnMigration("ALTER TABLE folders ADD COLUMN user_uuid TEXT NOT NULL DEFAULT ''", 'folders.user_uuid');
  runColumnMigration("ALTER TABLE agent_keys ADD COLUMN user_uuid TEXT NOT NULL DEFAULT ''", 'agent_keys.user_uuid');
  runColumnMigration("ALTER TABLE settings ADD COLUMN user_uuid TEXT NOT NULL DEFAULT ''", 'settings.user_uuid');

  runColumnMigration('ALTER TABLE api_tokens ADD COLUMN expires_at TEXT', 'api_tokens.expires_at');
  db.prepare("UPDATE api_tokens SET expires_at = datetime('now', '+90 days') WHERE expires_at IS NULL").run();

  runColumnMigration('ALTER TABLE agent_keys ADD COLUMN revoked_at TEXT', 'agent_keys.revoked_at');
  runColumnMigration('ALTER TABLE agent_keys ADD COLUMN revoked_by TEXT', 'agent_keys.revoked_by');
  runColumnMigration('ALTER TABLE agent_keys ADD COLUMN revoke_reason TEXT', 'agent_keys.revoke_reason');
  runColumnMigration('ALTER TABLE bookmarks ADD COLUMN jina_url TEXT', 'bookmarks.jina_url');

  // Jina migration
  try {
    db.exec(`
      INSERT OR IGNORE INTO jina_conversions (bookmark_id, user_uuid, url, created_at)
      SELECT id, user_uuid, jina_url, updated_at
      FROM bookmarks
      WHERE jina_url IS NOT NULL
    `);
  } catch {}

  // Indexes
  db.exec(`
    DROP INDEX IF EXISTS idx_bookmarks_jina_url;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_key_hash ON users(key_hash);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_bookmarks_user_url ON bookmarks(user_uuid, url);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_jina_conversions_user ON jina_conversions(user_uuid);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_user_key ON settings(user_uuid, key);
    CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_audit_event_type ON audit_logs(event_type);
    CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor);
    CREATE INDEX IF NOT EXISTS idx_audit_outcome ON audit_logs(outcome);
    CREATE INDEX IF NOT EXISTS idx_api_tokens_key ON api_tokens(key);
    CREATE INDEX IF NOT EXISTS idx_api_tokens_expires_at ON api_tokens(expires_at);
    CREATE INDEX IF NOT EXISTS idx_agent_keys_api_key ON agent_keys(api_key);
    CREATE INDEX IF NOT EXISTS idx_agent_keys_active ON agent_keys(is_active);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_user_folder_created ON bookmarks(user_uuid, folder_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created ON bookmarks(user_uuid, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_folders_user ON folders(user_uuid);
    DROP INDEX IF EXISTS idx_bookmarks_user_folder;
  `);
}
