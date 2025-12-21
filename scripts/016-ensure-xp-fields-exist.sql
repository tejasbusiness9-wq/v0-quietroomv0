-- Ensuring XP fields exist and have proper defaults for profiles and goals

-- Update profiles table to ensure XP tracking fields exist
-- Note: These should already exist from 001-create-profiles-table.sql, but this ensures consistency
DO $$ 
BEGIN
  -- Add total_xp if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'total_xp'
  ) THEN
    ALTER TABLE profiles ADD COLUMN total_xp INTEGER DEFAULT 0;
  END IF;

  -- Add current_xp if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'current_xp'
  ) THEN
    ALTER TABLE profiles ADD COLUMN current_xp INTEGER DEFAULT 0;
  END IF;

  -- Add xp_to_next_level if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'xp_to_next_level'
  ) THEN
    ALTER TABLE profiles ADD COLUMN xp_to_next_level INTEGER DEFAULT 100;
  END IF;
END $$;

-- Update goals table to ensure XP tracking fields exist
DO $$ 
BEGIN
  -- Add xp (current XP) if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'goals' AND column_name = 'xp'
  ) THEN
    ALTER TABLE goals ADD COLUMN xp INTEGER DEFAULT 0;
  END IF;

  -- Add max_xp (required XP) if it doesn't exist - will be calculated from hours
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'goals' AND column_name = 'max_xp'
  ) THEN
    ALTER TABLE goals ADD COLUMN max_xp INTEGER DEFAULT 1000;
  END IF;

  -- Add target_hours field to store the user-friendly hour value
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'goals' AND column_name = 'target_hours'
  ) THEN
    ALTER TABLE goals ADD COLUMN target_hours INTEGER;
  END IF;
END $$;

-- Create or replace function to award XP to user profile
CREATE OR REPLACE FUNCTION award_xp_to_profile(
  p_user_id UUID,
  p_xp_amount INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_xp INTEGER;
  v_xp_to_next_level INTEGER;
  v_level INTEGER;
  v_remaining_xp INTEGER;
BEGIN
  -- Get current profile stats
  SELECT current_xp, xp_to_next_level, level
  INTO v_current_xp, v_xp_to_next_level, v_level
  FROM profiles
  WHERE user_id = p_user_id;

  -- Add XP
  v_remaining_xp := v_current_xp + p_xp_amount;

  -- Level up loop (in case they gain multiple levels)
  WHILE v_remaining_xp >= v_xp_to_next_level LOOP
    v_remaining_xp := v_remaining_xp - v_xp_to_next_level;
    v_level := v_level + 1;
    v_xp_to_next_level := v_xp_to_next_level + 50; -- Each level requires 50 more XP
  END LOOP;

  -- Update profile
  UPDATE profiles
  SET 
    total_xp = total_xp + p_xp_amount,
    current_xp = v_remaining_xp,
    level = v_level,
    xp_to_next_level = v_xp_to_next_level,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;

-- Create or replace function to award XP to goal
CREATE OR REPLACE FUNCTION award_xp_to_goal(
  p_goal_id UUID,
  p_xp_amount INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_xp INTEGER;
  v_max_xp INTEGER;
  v_new_progress INTEGER;
BEGIN
  -- Get current goal stats
  SELECT xp, max_xp
  INTO v_new_xp, v_max_xp
  FROM goals
  WHERE id = p_goal_id;

  -- Add XP (cap at max_xp)
  v_new_xp := LEAST(v_new_xp + p_xp_amount, v_max_xp);
  
  -- Calculate new progress percentage
  v_new_progress := (v_new_xp * 100) / v_max_xp;

  -- Update goal
  UPDATE goals
  SET 
    xp = v_new_xp,
    progress = v_new_progress,
    updated_at = NOW(),
    -- Mark as completed if reached max XP
    status = CASE WHEN v_new_xp >= v_max_xp THEN 'completed' ELSE status END,
    completed_at = CASE WHEN v_new_xp >= v_max_xp THEN NOW() ELSE completed_at END
  WHERE id = p_goal_id;
END;
$$;

-- Create index for faster XP queries
CREATE INDEX IF NOT EXISTS profiles_total_xp_idx ON profiles(total_xp DESC);
CREATE INDEX IF NOT EXISTS goals_xp_idx ON goals(xp, max_xp);
