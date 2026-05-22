-- 0002_add_pinned_state.up.sql
-- Add 'pinned' boolean column to bookmarks
ALTER TABLE bookmarks ADD COLUMN pinned INTEGER DEFAULT 0;

-- Drop the unique URL constraint to allow duplicate URLs (Pinchmarks) for the same user
DROP INDEX IF EXISTS idx_bookmarks_user_url;
