-- 0002_add_pinned_state.down.sql
-- Recreate the unique URL constraint for bookmarks
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookmarks_user_url ON bookmarks(user_uuid, url);

-- Drop the 'pinned' column
ALTER TABLE bookmarks DROP COLUMN pinned;
