-- Create a view for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  p.user_id,
  p.username,
  p.level,
  p.total_xp,
  COUNT(DISTINCT t.id) FILTER (WHERE t.completed = true) as tasks_completed,
  COUNT(DISTINCT g.id) FILTER (WHERE g.status = 'completed') as goals_completed,
  COUNT(DISTINCT zs.id) as zen_sessions_completed,
  COALESCE(SUM(zs.duration_minutes), 0) as total_zen_minutes,
  s.current_streak,
  s.longest_streak,
  COUNT(DISTINCT ua.achievement_id) as achievements_unlocked
FROM profiles p
LEFT JOIN tasks t ON p.user_id = t.user_id
LEFT JOIN goals g ON p.user_id = g.user_id
LEFT JOIN zen_sessions zs ON p.user_id = zs.user_id AND zs.completed = true
LEFT JOIN streaks s ON p.user_id = s.user_id
LEFT JOIN user_achievements ua ON p.user_id = ua.user_id
GROUP BY p.user_id, p.username, p.level, p.total_xp, s.current_streak, s.longest_streak;
