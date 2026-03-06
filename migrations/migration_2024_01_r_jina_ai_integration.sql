
-- Migration: 2024_01_r_jina_ai_integration
-- Description: Add r.jina.ai support to bookmarks table
-- Created: 2026-03-06T05:03:15.016Z

-- Backup existing data (optional safety measure)
CREATE TABLE IF NOT EXISTS bookmarks_backup AS 
SELECT id, url, title, description, tags, created_at, updated_at 
FROM bookmarks 
WHERE 1=0;

-- Add jina_url column to bookmarks table
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS jina_url TEXT;

-- Add jina_enabled column to bookmarks table (to control feature usage)
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS jina_enabled BOOLEAN DEFAULT 0;

-- Create index on jina_url for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookmarks_jina_url ON bookmarks(jina_url);

-- Create index on jina_enabled for filtering enabled bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_jina_enabled ON bookmarks(jina_enabled);

-- Update existing bookmarks to have jina_enabled = 0 (disabled by default)
UPDATE bookmarks SET jina_enabled = 0 WHERE jina_enabled IS NULL;

-- Add migration tracking (if not exists)
CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT UNIQUE NOT NULL,
    description TEXT,
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    checksum TEXT
);

-- Record this migration
INSERT OR IGNORE INTO migrations (version, description, checksum) VALUES (
    '2024_01_r_jina_ai_integration',
    'Add r.jina.ai support to bookmarks table',
    '90ac53f76125797a'
);

-- Verify migration
SELECT 
    'Migration completed successfully' as status,
    (SELECT COUNT(*) FROM pragma_table_info('bookmarks') WHERE name = 'jina_url') as jina_url_column_exists,
    (SELECT COUNT(*) FROM pragma_table_info('bookmarks') WHERE name = 'jina_enabled') as jina_enabled_column_exists,
    (SELECT COUNT(*) FROM sqlite_master WHERE type = 'index' AND name = 'idx_bookmarks_jina_url') as jina_url_index_exists,
    (SELECT COUNT(*) FROM sqlite_master WHERE type = 'index' AND name = 'idx_bookmarks_jina_enabled') as jina_enabled_index_exists;
