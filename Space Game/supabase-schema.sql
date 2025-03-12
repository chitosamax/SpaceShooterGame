-- Create leaderboard table
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_initials VARCHAR(3) NOT NULL,
  player_email VARCHAR(255),
  score INTEGER NOT NULL,
  difficulty VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Add RLS (Row Level Security) policies
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the leaderboard
CREATE POLICY "Anyone can read leaderboard" 
  ON leaderboard FOR SELECT USING (true);

-- Allow authenticated users to insert their own entries
CREATE POLICY "Authenticated users can insert their own entries" 
  ON leaderboard FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create function to get top scores
CREATE OR REPLACE FUNCTION get_top_scores(limit_count INTEGER DEFAULT 10, difficulty_filter TEXT DEFAULT NULL)
RETURNS SETOF leaderboard AS $$
BEGIN
  IF difficulty_filter IS NULL THEN
    RETURN QUERY
    SELECT * FROM leaderboard
    ORDER BY score DESC
    LIMIT limit_count;
  ELSE
    RETURN QUERY
    SELECT * FROM leaderboard
    WHERE difficulty = difficulty_filter
    ORDER BY score DESC
    LIMIT limit_count;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user's best score
CREATE OR REPLACE FUNCTION get_user_best_score(user_id_param UUID)
RETURNS TABLE (
  score INTEGER,
  difficulty TEXT,
  player_initials VARCHAR(3),
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT l.score, l.difficulty, l.player_initials, l.created_at
  FROM leaderboard l
  WHERE l.user_id = user_id_param
  ORDER BY l.score DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create index for faster queries
CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX idx_leaderboard_difficulty ON leaderboard(difficulty);
CREATE INDEX idx_leaderboard_user_id ON leaderboard(user_id);

-- Create realtime publication for leaderboard changes
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

-- Add leaderboard table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE leaderboard; 