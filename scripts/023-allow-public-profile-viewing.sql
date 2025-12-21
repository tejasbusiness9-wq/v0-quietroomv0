-- Enable public viewing of all profiles for leaderboard functionality
-- This allows users to see other users' profiles in the leaderboard

-- Drop the restrictive policy that only allows viewing own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create a new policy that allows viewing all profiles (for leaderboard)
CREATE POLICY "Anyone can view all profiles"
ON profiles
FOR SELECT
TO public
USING (true);

-- Keep the insert policy (users can only create their own profile)
-- Keep the update policy (users can only update their own profile)
