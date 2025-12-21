-- Update vision_board_items to support file uploads
-- Add a column to track upload type (url or file)
ALTER TABLE vision_board_items ADD COLUMN IF NOT EXISTS upload_type TEXT DEFAULT 'url';

-- Add a column for file paths if using storage
ALTER TABLE vision_board_items ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Update existing rows to have url type
UPDATE vision_board_items SET upload_type = 'url' WHERE upload_type IS NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS vision_board_items_upload_type_idx ON vision_board_items(upload_type);
