-- Create zen_sessions table to track zen mode sessions
CREATE TABLE IF NOT EXISTS zen_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  environment_id UUID REFERENCES zen_environments(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE zen_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for zen_sessions
CREATE POLICY "Users can view their own zen sessions"
  ON zen_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own zen sessions"
  ON zen_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own zen sessions"
  ON zen_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS zen_sessions_user_id_idx ON zen_sessions(user_id);
CREATE INDEX IF NOT EXISTS zen_sessions_environment_id_idx ON zen_sessions(environment_id);
CREATE INDEX IF NOT EXISTS zen_sessions_task_id_idx ON zen_sessions(task_id);
CREATE INDEX IF NOT EXISTS zen_sessions_started_at_idx ON zen_sessions(started_at);
