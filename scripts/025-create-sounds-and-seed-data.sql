-- Drop existing tables to ensure clean recreation with correct schema
DROP TABLE IF EXISTS system_environments CASCADE;
DROP TABLE IF EXISTS system_sounds CASCADE;

-- Create system_environments table (separate from user zen_environments)
CREATE TABLE system_environments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  background_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  category TEXT DEFAULT 'nature',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create system_sounds table for ambient sounds
CREATE TABLE system_sounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  category TEXT DEFAULT 'nature',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE system_environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_sounds ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view system environments (public resource)
CREATE POLICY "Anyone can view system environments"
ON system_environments FOR SELECT
TO public
USING (true);

-- Policy: Anyone can view system sounds (public resource)
CREATE POLICY "Anyone can view system sounds"
ON system_sounds FOR SELECT
TO public
USING (true);

-- Insert mountain environment
INSERT INTO system_environments (
  name,
  description,
  background_url,
  file_type,
  category
) VALUES (
  'Misty Mountains',
  'Serene waterfalls cascading through lush green forests',
  '/images/mountain.gif',
  'gif',
  'nature'
);

-- Insert bird sounds
INSERT INTO system_sounds (
  name,
  description,
  icon_name,
  audio_url,
  file_type,
  category
) VALUES (
  'Forest Birds',
  'Peaceful chirping of birds in nature',
  'bird',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/birds-EVISQ2MjtEZAGDaJOktf6ewRiAqmY2.webm',
  'webm',
  'nature'
);
