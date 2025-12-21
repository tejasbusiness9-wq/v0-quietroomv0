-- Create function to automatically create profile for new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert new profile row for the newly created auth user
  INSERT INTO public.profiles (
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
    NEW.id,
    -- Use email prefix or generate a unique username
    COALESCE(
      SPLIT_PART(NEW.email, '@', 1),
      'user_' || SUBSTRING(NEW.id::text, 1, 8)
    ),
    -- Use full name from metadata or email prefix
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    'Novice Quester', -- Default user class
    1,  -- Starting level
    0,  -- Starting total XP
    0,  -- Starting current XP
    150, -- XP needed for level 2 (150 * 1.15^0)
    0,  -- Starting coins
    -- Use avatar from OAuth provider or generate one
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id
    )
  )
  ON CONFLICT (user_id) DO NOTHING; -- Prevent duplicate profile creation
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that fires after a new user is inserted into auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
