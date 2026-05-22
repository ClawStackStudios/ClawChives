-- 0001_initial.down.sql
-- Baseline schema teardown for ClawChives

DROP INDEX IF EXISTS idx_import_sessions_user;
DROP TABLE IF EXISTS import_sessions;

DROP TABLE IF EXISTS system_settings;

DROP INDEX IF EXISTS idx_settings_user_key;
DROP TABLE IF EXISTS settings;

DROP INDEX IF EXISTS idx_jina_conversions_user;
DROP TABLE IF EXISTS jina_conversions;

DROP INDEX IF EXISTS idx_agent_keys_user;
DROP INDEX IF EXISTS idx_agent_keys_active;
DROP INDEX IF EXISTS idx_agent_keys_api_key;
DROP TABLE IF EXISTS agent_keys;

DROP INDEX IF EXISTS idx_folders_user;
DROP TABLE IF EXISTS folders;

DROP INDEX IF EXISTS idx_bookmarks_user_created;
DROP INDEX IF EXISTS idx_bookmarks_user_folder_created;
DROP INDEX IF EXISTS idx_bookmarks_user_url;
DROP TABLE IF EXISTS bookmarks;

DROP INDEX IF EXISTS idx_api_tokens_owner;
DROP INDEX IF EXISTS idx_api_tokens_expires_at;
DROP INDEX IF EXISTS idx_api_tokens_key;
DROP TABLE IF EXISTS api_tokens;

DROP INDEX IF EXISTS idx_users_key_hash;
DROP TABLE IF EXISTS users;
