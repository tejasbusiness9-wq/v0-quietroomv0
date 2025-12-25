-- Add default environments available to all users
-- Insert default environments
INSERT INTO system_environments (name, description, background_url, category, file_type, media_type) VALUES
  ('Coffee Shop', 'Cozy coffee shop ambiance perfect for productivity', '/placeholder.svg?height=400&width=600', 'static', 'jpg', 'static'),
  ('Mountain Vista', 'Serene mountain landscape with peaceful atmosphere', '/videos/mountain-vista.mp4', 'animated', 'mp4', 'animated'),
  ('Cozy Room', 'Warm and inviting room setting', '/videos/cozy-room.mp4', 'animated', 'mp4', 'animated')
ON CONFLICT DO NOTHING;
