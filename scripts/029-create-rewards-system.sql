-- Create rewards_items table for shop items
CREATE TABLE IF NOT EXISTS rewards_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('system', 'bounty')),
  type TEXT NOT NULL, -- 'environment', 'sound', 'permission'
  price INTEGER NOT NULL,
  media_url TEXT,
  media_type TEXT, -- 'image', 'video', 'audio'
  icon_name TEXT,
  metadata JSONB, -- For additional data like duration for permissions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE rewards_items ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view rewards items
DROP POLICY IF EXISTS "Anyone can view rewards items" ON rewards_items;
CREATE POLICY "Anyone can view rewards items"
  ON rewards_items FOR SELECT
  TO public
  USING (true);

-- Insert rewards items
INSERT INTO rewards_items (name, description, category, type, price, media_url, media_type, icon_name) VALUES
-- System Shop Items
('Ramen Shop', 'Cozy animated ramen shop environment', 'system', 'environment', 500, '/images/ramen-shop.mp4', 'video', 'Video'),
('Art Store', 'Creative art store atmosphere', 'system', 'environment', 500, '/images/art-store.mp4', 'video', 'Palette'),
('Fire Sounds', 'Crackling fireplace ambiance', 'system', 'sound', 200, '/images/fire-sound.mp3', 'audio', 'Flame'),

-- Bounty Board Items (Real Life Permissions)
('1 Hour Gaming', 'Permission to game for 1 hour', 'bounty', 'permission', 300, NULL, NULL, 'Gamepad2'),
('Cheat Meal', 'Enjoy your favorite treat guilt-free', 'bounty', 'permission', 400, NULL, NULL, 'Pizza'),
('Social Media (30min)', 'Browse socials for 30 minutes', 'bounty', 'permission', 250, NULL, NULL, 'Smartphone'),
('Movie Night', 'Watch a movie of your choice', 'bounty', 'permission', 500, NULL, NULL, 'Film'),
('Sleep In (+1 Hour)', 'Sleep an extra hour tomorrow', 'bounty', 'permission', 350, NULL, NULL, 'Moon');
