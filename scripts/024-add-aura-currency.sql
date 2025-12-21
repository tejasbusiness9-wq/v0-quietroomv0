-- Add Aura currency system
-- Users get 50 Aura per level up

-- Add aura column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS aura INTEGER DEFAULT 0;

-- Update existing level 2 profiles to have 50 Aura
UPDATE profiles SET aura = 50 WHERE level = 2 AND aura = 0;

-- Update level 3+ profiles to have appropriate Aura based on their level
UPDATE profiles SET aura = (level - 1) * 50 WHERE level > 2;

-- Update the task completion trigger to award Aura on level up
CREATE OR REPLACE FUNCTION handle_task_completion_xp()
RETURNS TRIGGER AS $$
DECLARE
  xp_to_award INTEGER := 3;
  current_total_xp INTEGER;
  current_current_xp INTEGER;
  current_level INTEGER;
  current_xp_to_next INTEGER;
  current_aura INTEGER;
  new_level INTEGER;
  xp_for_next_level INTEGER;
  levels_gained INTEGER := 0;
BEGIN
  IF NEW.completed = true AND (OLD.completed = false OR OLD.completed IS NULL) THEN
    
    -- Get current profile data
    SELECT total_xp, current_xp, level, xp_to_next_level, aura
    INTO current_total_xp, current_current_xp, current_level, current_xp_to_next, current_aura
    FROM profiles
    WHERE user_id = NEW.user_id;
    
    -- Calculate new values
    new_level := current_level;
    xp_for_next_level := current_xp_to_next;
    current_total_xp := current_total_xp + xp_to_award;
    current_current_xp := current_current_xp + xp_to_award;
    
    -- Check for level up and count how many levels gained
    WHILE current_current_xp >= xp_for_next_level LOOP
      new_level := new_level + 1;
      levels_gained := levels_gained + 1;
      current_current_xp := current_current_xp - xp_for_next_level;
      xp_for_next_level := FLOOR(150 * POWER(1.15, new_level - 1));
    END LOOP;
    
    -- Award 50 Aura per level gained
    IF levels_gained > 0 THEN
      current_aura := current_aura + (levels_gained * 50);
    END IF;
    
    -- Update profile with new XP, level, and Aura
    UPDATE profiles
    SET 
      total_xp = current_total_xp,
      current_xp = current_current_xp,
      level = new_level,
      xp_to_next_level = xp_for_next_level,
      aura = current_aura,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
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
DROP TRIGGER IF EXISTS on_task_completion_xp ON tasks;
CREATE TRIGGER on_task_completion_xp
AFTER UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION handle_task_completion_xp();
