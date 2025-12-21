-- Update the task completion trigger to award 3 XP instead of 10
CREATE OR REPLACE FUNCTION handle_task_completion_xp()
RETURNS TRIGGER AS $$
DECLARE
  xp_to_award INTEGER := 3;  -- Changed from 10 to 3
  current_total_xp INTEGER;
  current_current_xp INTEGER;
  current_level INTEGER;
  current_xp_to_next INTEGER;
  new_level INTEGER;
  xp_for_next_level INTEGER;
BEGIN
  IF NEW.completed = true AND (OLD.completed = false OR OLD.completed IS NULL) THEN
    
    SELECT total_xp, current_xp, level, xp_to_next_level
    INTO current_total_xp, current_current_xp, current_level, current_xp_to_next
    FROM profiles
    WHERE user_id = NEW.user_id;
    
    new_level := current_level;
    xp_for_next_level := current_xp_to_next;
    current_total_xp := current_total_xp + xp_to_award;
    current_current_xp := current_current_xp + xp_to_award;
    
    WHILE current_current_xp >= xp_for_next_level LOOP
      new_level := new_level + 1;
      current_current_xp := current_current_xp - xp_for_next_level;
      xp_for_next_level := FLOOR(150 * POWER(1.15, new_level - 1));
    END LOOP;
    
    UPDATE profiles
    SET 
      total_xp = current_total_xp,
      current_xp = current_current_xp,
      level = new_level,
      xp_to_next_level = xp_for_next_level,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    IF NEW.goal_id IS NOT NULL THEN
      UPDATE goals
      SET xp = xp + xp_to_award
      WHERE id = NEW.goal_id;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
