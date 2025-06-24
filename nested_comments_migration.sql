-- Add parent_id column to forum_replies table for nested comments
ALTER TABLE forum_replies 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE;

-- Create index for faster queries on parent_id
CREATE INDEX IF NOT EXISTS idx_forum_replies_parent_id ON forum_replies(parent_id);

-- Create index for faster queries on post_id and parent_id combination
CREATE INDEX IF NOT EXISTS idx_forum_replies_post_parent ON forum_replies(post_id, parent_id);

-- Add comment to explain the new column
COMMENT ON COLUMN forum_replies.parent_id IS 'References the parent comment ID for nested replies. NULL means it is a top-level comment.'; 