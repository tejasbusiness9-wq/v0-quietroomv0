-- Create function to update user streak when XP is earned
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_today DATE;
  v_yesterday DATE;
  v_last_activity_date DATE;
  v_current_streak INT;
  v_longest_streak INT;
BEGIN
  -- Only process if XP was earned
  IF NEW.xp_earned IS NULL OR NEW.xp_earned <= 0 THEN
    RETURN NEW;
  END IF;

  v_user_id := NEW.user_id;
  v_today := CURRENT_DATE;
  v_yesterday := v_today - INTERVAL '1 day';

  -- Get existing streak data
  SELECT last_activity_date, current_streak, longest_streak
  INTO v_last_activity_date, v_current_streak, v_longest_streak
  FROM streaks
  WHERE user_id = v_user_id;

  -- If no streak record exists, create one
  IF NOT FOUND THEN
    INSERT INTO streaks (user_id, current_streak, longest_streak, last_activity_date, total_active_days, created_at, updated_at)
    VALUES (v_user_id, 1, 1, v_today, 1, NOW(), NOW());
    RETURN NEW;
  END IF;

  -- If activity already recorded today, don't update streak
  IF v_last_activity_date = v_today THEN
    RETURN NEW;
  END IF;

  -- If activity was yesterday, increment streak
  IF v_last_activity_date = v_yesterday THEN
    v_current_streak := v_current_streak + 1;
    v_longest_streak := GREATEST(v_longest_streak, v_current_streak);
    
    UPDATE streaks
    SET current_streak = v_current_streak,
        longest_streak = v_longest_streak,
        last_activity_date = v_today,
        total_active_days = total_active_days + 1,
        updated_at = NOW()
    WHERE user_id = v_user_id;
  -- If more than 1 day gap, reset streak to 1
  ELSE
    UPDATE streaks
    SET current_streak = 1,
        last_activity_date = v_today,
        total_active_days = total_active_days + 1,
        updated_at = NOW()
    WHERE user_id = v_user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on activity_log table
DROP TRIGGER IF EXISTS trigger_update_streak ON activity_log;
CREATE TRIGGER trigger_update_streak
  AFTER INSERT ON activity_log
  FOR EACH ROW
  EXECUTE FUNCTION update_user_streak();
