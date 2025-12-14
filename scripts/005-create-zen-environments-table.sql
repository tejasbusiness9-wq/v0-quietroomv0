-- Create zen_environments table for zen mode settings
CREATE TABLE IF NOT EXISTS zen_environments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  background_type TEXT DEFAULT 'gradient' CHECK (background_type IN ('gradient', 'video', 'image', 'color')),
  background_value TEXT,
  ambient_sound_url TEXT,
  ambient_sound_name TEXT,
  ambient_sound_volume INTEGER DEFAULT 50 CHECK (ambient_sound_volume >= 0 AND ambient_sound_volume <= 100),
  timer_duration INTEGER DEFAULT 25, -- in minutes
  is_default BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE zen_environments ENABLE ROW LEVEL SECURITY;

-- Create policies for zen_environments
CREATE POLICY "Users can view their own zen environments"
  ON zen_environments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own zen environments"
  ON zen_environments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own zen environments"
  ON zen_environments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own zen environments"
  ON zen_environments FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS zen_environments_user_id_idx ON zen_environments(user_id);
CREATE INDEX IF NOT EXISTS zen_environments_is_favorite_idx ON zen_environments(is_favorite);

-- Create trigger
CREATE TRIGGER update_zen_environments_updated_at
  BEFORE UPDATE ON zen_environments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
