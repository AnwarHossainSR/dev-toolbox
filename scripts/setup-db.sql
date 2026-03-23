-- Create tool_usage_history table
CREATE TABLE IF NOT EXISTS tool_usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name VARCHAR(255) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  input TEXT,
  output TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for tool_usage_history
CREATE INDEX IF NOT EXISTS idx_user_id_tool ON tool_usage_history(user_id, tool_name);
CREATE INDEX IF NOT EXISTS idx_user_id_used_at ON tool_usage_history(user_id, used_at DESC);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, tool_name)
);

-- Create index for favorites
CREATE INDEX IF NOT EXISTS idx_user_id ON favorites(user_id);

-- Enable Row Level Security
ALTER TABLE tool_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tool_usage_history
CREATE POLICY "Users can view their own usage history"
  ON tool_usage_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage history"
  ON tool_usage_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for favorites
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);
