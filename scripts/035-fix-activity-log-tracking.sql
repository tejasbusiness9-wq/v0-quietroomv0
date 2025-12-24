-- Ensure task completion trigger creates activity_log entries
-- This fixes the "XP Earned Today" display showing 0

-- Drop and recreate the task completion trigger to include activity_log creation
DROP TRIGGER IF EXISTS on_task_completion_xp ON tasks;
DROP FUNCTION IF EXISTS handle_task_completion_xp();

CREATE OR REPLACE FUNCTION handle_task_completion_xp()
RETURNS TRIGGER AS $$
DECLARE
  xp_to_award INTEGER := 3; -- Fixed to 3 XP per task
  current_total_xp INTEGER;
  current_current_xp INTEGER;
  current_level INTEGER;
  current_xp_to_next INTEGER;
  new_level INTEGER;
  xp_for_next_level INTEGER;
BEGIN
  -- Only run if the task is being marked as completed (and wasn't before)
  IF NEW.completed = true AND (OLD.completed = false OR OLD.completed IS NULL) THEN
    
    -- Get current profile data
    SELECT total_xp, current_xp, level, xp_to_next_level
    INTO current_total_xp, current_current_xp, current_level, current_xp_to_next
    FROM profiles
    WHERE user_id = NEW.user_id;
    
    -- Calculate new values
    new_level := current_level;
    xp_for_next_level := current_xp_to_next;
    current_total_xp := current_total_xp + xp_to_award;
    current_current_xp := current_current_xp + xp_to_award;
    
    -- Check for level up using formula: 150 * 1.15^(level-1)
    WHILE current_current_xp >= xp_for_next_level LOOP
      new_level := new_level + 1;
      current_current_xp := current_current_xp - xp_for_next_level;
      xp_for_next_level := FLOOR(150 * POWER(1.15, new_level - 1));
    END LOOP;
    
    -- Update profile with new XP and level
    UPDATE profiles
    SET 
      total_xp = current_total_xp,
      current_xp = current_current_xp,
      level = new_level,
      xp_to_next_level = xp_for_next_level,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Create activity_log entry for task completion
    INSERT INTO activity_log (user_id, activity_type, related_id, xp_earned, metadata)
    VALUES (
      NEW.user_id,
      'task_completed',
      NEW.id,
      xp_to_award,
      jsonb_build_object(
        'task_title', NEW.title,
        'goal_id', NEW.goal_id
      )
    );
    
    -- If the task has a linked goal, add XP to the goal
    IF NEW.goal_id IS NOT NULL THEN
      UPDATE goals
      SET 
        xp = xp + xp_to_award,
        updated_at = NOW()
      WHERE id = NEW.goal_id;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_task_completion_xp
AFTER UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION handle_task_completion_xp();
