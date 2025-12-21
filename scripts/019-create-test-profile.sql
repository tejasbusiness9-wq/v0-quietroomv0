-- Create a completely empty test profile for testing
-- Run this to reset the test user to level 1 with 0 XP

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the dev bypass test user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'testuser@gmail.com';

  IF v_user_id IS NOT NULL THEN
    -- Delete all existing data for this test user
    DELETE FROM zen_sessions WHERE user_id = v_user_id;
    DELETE FROM activity_log WHERE user_id = v_user_id;
    DELETE FROM tasks WHERE user_id = v_user_id;
    DELETE FROM goals WHERE user_id = v_user_id;
    
    -- Reset profile to level 1 with 0 XP
    UPDATE profiles
    SET 
      level = 1,
      total_xp = 0,
      current_xp = 0,
      xp_to_next_level = 150,
      coins = 0,
      username = 'testuser',
      display_name = 'Test User',
      user_class = 'Novice Quester',
      avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser',
      bio = NULL,
      updated_at = NOW()
    WHERE user_id = v_user_id;

    -- If profile doesn't exist, create it
    IF NOT FOUND THEN
      INSERT INTO profiles (
        user_id,
        username,
        display_name,
        user_class,
        level,
        total_xp,
        current_xp,
        xp_to_next_level,
        coins,
        avatar_url
      ) VALUES (
        v_user_id,
        'testuser',
        'Test User',
        'Novice Quester',
        1,
        0,
        0,
        150,
        0,
        'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser'
      );
    END IF;

    RAISE NOTICE 'Test profile reset to level 1 with 0 XP';
  ELSE
    RAISE NOTICE 'Test user not found. Please run dev bypass login first.';
  END IF;
END $$;
