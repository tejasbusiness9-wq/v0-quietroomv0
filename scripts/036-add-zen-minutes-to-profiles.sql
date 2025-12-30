-- Add zen_minutes column to profiles table to track total zen time
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS zen_minutes INTEGER DEFAULT 0;

-- Update existing profiles with their total zen minutes from zen_sessions
UPDATE profiles
SET zen_minutes = COALESCE((
  SELECT SUM(duration_minutes)
  FROM zen_sessions
  WHERE zen_sessions.user_id = profiles.user_id
  AND zen_sessions.completed = true
), 0);
