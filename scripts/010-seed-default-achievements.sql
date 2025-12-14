-- Seed default achievements
INSERT INTO achievements (code, name, description, icon, xp_reward, rarity, category) VALUES
  ('first_task', 'First Quest Complete', 'Complete your first task', '✅', 50, 'common', 'tasks'),
  ('task_streak_7', 'Week Warrior', 'Maintain a 7-day task streak', '🔥', 150, 'rare', 'streaks'),
  ('task_streak_30', 'Monthly Master', 'Maintain a 30-day task streak', '⚡', 500, 'epic', 'streaks'),
  ('first_goal', 'Goal Setter', 'Create your first goal', '🎯', 50, 'common', 'goals'),
  ('goal_completed_1', 'Goal Achiever', 'Complete your first goal', '🏆', 200, 'rare', 'goals'),
  ('goal_completed_5', 'Goal Master', 'Complete 5 goals', '🌟', 500, 'epic', 'goals'),
  ('zen_session_1', 'Zen Beginner', 'Complete your first zen mode session', '🧘', 75, 'common', 'zen'),
  ('zen_session_10', 'Zen Warrior', 'Complete 10 zen mode sessions', '🧘‍♂️', 250, 'rare', 'zen'),
  ('zen_hours_10', 'Deep Focus', 'Spend 10 hours in zen mode', '⏱️', 400, 'epic', 'zen'),
  ('level_10', 'Rising Star', 'Reach level 10', '⭐', 300, 'rare', 'progression'),
  ('level_25', 'Veteran Quester', 'Reach level 25', '💫', 750, 'epic', 'progression'),
  ('level_50', 'Legendary Hero', 'Reach level 50', '👑', 2000, 'legendary', 'progression'),
  ('tasks_100', 'Centurion', 'Complete 100 tasks', '💯', 600, 'epic', 'tasks'),
  ('early_bird', 'Early Bird', 'Complete a task before 8 AM', '🌅', 100, 'common', 'tasks'),
  ('night_owl', 'Night Owl', 'Complete a task after 10 PM', '🌙', 100, 'common', 'tasks')
ON CONFLICT (code) DO NOTHING;
