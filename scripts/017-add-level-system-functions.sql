-- Add leveling system functions and update profiles table

-- Create function to calculate XP required for next level
CREATE OR REPLACE FUNCTION calculate_xp_for_level(level_num integer)
RETURNS integer AS $$
BEGIN
  -- Progressive XP curve: Base 100 + (level * 50)
  -- Level 1->2: 150 XP
  -- Level 2->3: 200 XP
  -- Level 3->4: 250 XP, etc.
  RETURN 100 + (level_num * 50);
END;
$$ LANGUAGE plpgsql;

-- Create function to get level from total XP
CREATE OR REPLACE FUNCTION get_level_from_xp(total_xp_amount integer)
RETURNS integer AS $$
DECLARE
  current_level integer := 1;
  xp_needed integer := 0;
  cumulative_xp integer := 0;
BEGIN
  -- Calculate level based on cumulative XP
  WHILE cumulative_xp <= total_xp_amount AND current_level < 100 LOOP
    xp_needed := calculate_xp_for_level(current_level);
    cumulative_xp := cumulative_xp + xp_needed;
    IF cumulative_xp <= total_xp_amount THEN
      current_level := current_level + 1;
    END IF;
  END LOOP;
  
  RETURN current_level;
END;
$$ LANGUAGE plpgsql;

-- Create function to award XP and handle leveling
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id uuid,
  p_xp_amount integer,
  p_activity_type text,
  p_related_id uuid DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_profile RECORD;
  v_old_level integer;
  v_new_level integer;
  v_leveled_up boolean := false;
  v_xp_to_next integer;
  v_result jsonb;
BEGIN
  -- Get current profile data
  SELECT * INTO v_profile
  FROM profiles
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user_id: %', p_user_id;
  END IF;

  v_old_level := COALESCE(v_profile.level, 1);
  
  -- Update total and current XP
  UPDATE profiles
  SET 
    total_xp = COALESCE(total_xp, 0) + p_xp_amount,
    current_xp = COALESCE(current_xp, 0) + p_xp_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING * INTO v_profile;

  -- Calculate new level
  v_new_level := get_level_from_xp(v_profile.total_xp);
  
  -- Check if leveled up
  IF v_new_level > v_old_level THEN
    v_leveled_up := true;
    
    -- Update level
    UPDATE profiles
    SET 
      level = v_new_level,
      current_xp = v_profile.current_xp - (calculate_xp_for_level(v_old_level)),
      updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;

  -- Calculate XP to next level
  v_xp_to_next := calculate_xp_for_level(v_new_level);

  -- Log activity
  INSERT INTO activity_log (user_id, activity_type, xp_earned, related_id)
  VALUES (p_user_id, p_activity_type, p_xp_amount, p_related_id);

  -- Build result
  v_result := jsonb_build_object(
    'xp_earned', p_xp_amount,
    'total_xp', v_profile.total_xp,
    'current_xp', v_profile.current_xp,
    'level', v_new_level,
    'old_level', v_old_level,
    'leveled_up', v_leveled_up,
    'xp_to_next_level', v_xp_to_next
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
