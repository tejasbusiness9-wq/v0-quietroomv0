-- Comprehensive Aura Rewards System Implementation
-- 1. Daily leaderboard claim with 24hr cooldown
-- 2. Goal completion rewards (10 Aura per hour invested)
-- 3. Level up bonus (50 Aura - already implemented)
-- 4. Timer session rewards (1 Aura per 5 minutes)

-- Add last_aura_claim_at column to profiles for leaderboard cooldown
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_aura_claim_at TIMESTAMP WITH TIME ZONE;

-- Add aura_earned column to goals to track rewards
ALTER TABLE goals ADD COLUMN IF NOT EXISTS aura_earned INTEGER DEFAULT 0;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS target_hours INTEGER;

-- Add aura_earned to zen_sessions
ALTER TABLE zen_sessions ADD COLUMN IF NOT EXISTS aura_earned INTEGER DEFAULT 0;

-- Function to award Aura for zen session completion
CREATE OR REPLACE FUNCTION award_zen_session_aura()
RETURNS TRIGGER AS $$
DECLARE
  session_aura INTEGER;
  current_profile_aura INTEGER;
BEGIN
  -- Only process completed sessions
  IF NEW.completed = true AND (OLD.completed = false OR OLD.completed IS NULL) THEN
    -- Calculate aura: 1 Aura per 5 minutes
    session_aura := FLOOR(NEW.duration_minutes / 5.0);
    
    -- Update session with aura earned
    NEW.aura_earned := session_aura;
    
    -- Get current profile aura
    SELECT aura INTO current_profile_aura
    FROM profiles
    WHERE user_id = NEW.user_id;
    
    -- Award aura to profile
    UPDATE profiles
    SET aura = COALESCE(aura, 0) + session_aura,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Log activity
    INSERT INTO activity_log (user_id, activity_type, xp_earned, metadata)
    VALUES (
      NEW.user_id,
      'zen_session_aura',
      0,
      jsonb_build_object(
        'aura_earned', session_aura,
        'duration_minutes', NEW.duration_minutes,
        'session_id', NEW.id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for zen session aura rewards
DROP TRIGGER IF EXISTS on_zen_session_aura ON zen_sessions;
CREATE TRIGGER on_zen_session_aura
BEFORE UPDATE ON zen_sessions
FOR EACH ROW
EXECUTE FUNCTION award_zen_session_aura();

-- Function to award Aura for goal completion
CREATE OR REPLACE FUNCTION award_goal_completion_aura()
RETURNS TRIGGER AS $$
DECLARE
  goal_aura INTEGER;
  hours_invested INTEGER;
BEGIN
  -- Check if goal just reached 100% completion
  IF NEW.progress >= 100 AND (OLD.progress < 100 OR OLD.progress IS NULL) AND NEW.status = 'active' THEN
    -- Calculate hours invested from XP (assuming 5 XP per minute from sessions)
    -- Average session XP per minute varies, so we estimate conservatively
    hours_invested := GREATEST(FLOOR(NEW.xp / 300.0), NEW.target_hours);
    
    -- Use target_hours if set, otherwise calculate from XP
    IF NEW.target_hours IS NOT NULL THEN
      hours_invested := NEW.target_hours;
    END IF;
    
    -- Award 10 Aura per hour invested
    goal_aura := hours_invested * 10;
    
    -- Update goal with aura earned
    NEW.aura_earned := goal_aura;
    NEW.status := 'completed';
    NEW.completed_at := NOW();
    
    -- Award aura to profile
    UPDATE profiles
    SET aura = COALESCE(aura, 0) + goal_aura,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Log activity
    INSERT INTO activity_log (user_id, activity_type, xp_earned, metadata)
    VALUES (
      NEW.user_id,
      'goal_completion_aura',
      0,
      jsonb_build_object(
        'aura_earned', goal_aura,
        'goal_id', NEW.id,
        'goal_title', NEW.title,
        'hours_invested', hours_invested
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for goal completion aura rewards
DROP TRIGGER IF EXISTS on_goal_completion_aura ON goals;
CREATE TRIGGER on_goal_completion_aura
BEFORE UPDATE ON goals
FOR EACH ROW
EXECUTE FUNCTION award_goal_completion_aura();

-- Create RPC function for leaderboard with aura (more reliable than view)
CREATE OR REPLACE FUNCTION get_leaderboard_with_aura()
RETURNS TABLE (
  id TEXT,
  user_id UUID,
  username TEXT,
  display_name TEXT,
  level INTEGER,
  total_xp BIGINT,
  avatar_url TEXT,
  user_class TEXT,
  aura INTEGER,
  last_aura_claim_at TIMESTAMP WITH TIME ZONE,
  rank BIGINT,
  can_claim_aura BOOLEAN,
  claimable_aura INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id::TEXT,
    p.user_id,
    p.username,
    p.display_name,
    p.level,
    p.total_xp,
    p.avatar_url,
    p.user_class,
    p.aura,
    p.last_aura_claim_at,
    ROW_NUMBER() OVER (ORDER BY p.total_xp DESC) as rank,
    CASE 
      WHEN p.last_aura_claim_at IS NULL THEN true
      WHEN p.last_aura_claim_at < NOW() - INTERVAL '24 hours' THEN true
      ELSE false
    END as can_claim_aura,
    CASE 
      WHEN ROW_NUMBER() OVER (ORDER BY p.total_xp DESC) BETWEEN 1 AND 10 THEN 100
      WHEN ROW_NUMBER() OVER (ORDER BY p.total_xp DESC) BETWEEN 11 AND 50 THEN 50
      WHEN ROW_NUMBER() OVER (ORDER BY p.total_xp DESC) BETWEEN 51 AND 100 THEN 20
      ELSE 0
    END::INTEGER as claimable_aura
  FROM profiles p
  ORDER BY p.total_xp DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_leaderboard_with_aura() TO authenticated;

-- Add RLS policies for new columns
-- Profiles already has RLS, just ensure the new columns are accessible
