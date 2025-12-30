-- Add field to track if user has seen the philosophy gate
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS has_seen_philosophy_gate BOOLEAN DEFAULT FALSE;

-- Update existing users to true (they already have accounts)
UPDATE profiles 
SET has_seen_philosophy_gate = TRUE 
WHERE has_seen_philosophy_gate IS NULL OR has_seen_philosophy_gate = FALSE;
