-- Drop existing tables and recreate with updated schema
DROP TABLE IF EXISTS system_environments CASCADE;
DROP TABLE IF EXISTS system_sounds CASCADE;

-- Create system_environments table with media_type field
CREATE TABLE system_environments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  background_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'jpg', 'gif', 'mp4', etc
  media_type TEXT NOT NULL, -- 'static', 'animated'
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create system_sounds table
CREATE TABLE system_sounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE system_environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_sounds ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist
DROP POLICY IF EXISTS "Anyone can view system environments" ON system_environments;
DROP POLICY IF EXISTS "Anyone can view system sounds" ON system_sounds;

-- Create policies
CREATE POLICY "Anyone can view system environments"
  ON system_environments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view system sounds"
  ON system_sounds FOR SELECT
  USING (true);

-- Insert static environments
INSERT INTO system_environments (name, description, background_url, file_type, media_type, category) VALUES
('Coffee Shop', 'Cozy coffee shop with warm lighting', '/images/coffee-shop.jpg', 'jpg', 'static', 'indoor');

-- Insert animated environments  
INSERT INTO system_environments (name, description, background_url, file_type, media_type, category) VALUES
('Mountains', 'Serene mountain waterfalls with mist', '/images/mountain.gif', 'gif', 'animated', 'nature'),
('Cozy Room', 'Warm room with glowing lamp', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/room%20%26%20lamp-b2ipygTmauIEMS1bXLkPfyGZ8KwDms.mp4', 'mp4', 'animated', 'indoor');

-- Insert all sounds with proper audio file paths
INSERT INTO system_sounds (name, description, icon_name, audio_url, file_type, category) VALUES
('Birds', 'Peaceful bird sounds', 'bird', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/birds-EVISQ2MjtEZAGDaJOktf6ewRiAqmY2.webm', 'webm', 'nature'),
('Underwater', 'Calm underwater ambience', 'waves', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/underwater-oU9HvPWFQlyfjaf1co6dKav4EJ2kEw.webm', 'webm', 'water'),
('Thunder & Rain', 'Relaxing thunderstorm', 'cloud-rain', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/thunder%20and%20rain-yV7zixrxiHELm8OFLsYvzZMfqo7iUR.mp3', 'mp3', 'weather'),
('Fire', 'Crackling fireplace', 'flame', '/images/fire-sound.mp3', 'mp3', 'indoor'),
('Winter Storm', 'Howling wind and snow', 'snowflake', '/images/howling-winter-storm.mp3', 'mp3', 'weather');
