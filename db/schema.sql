-- Hackathon Quiz System schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_name TEXT NOT NULL,
  secret_hash TEXT NOT NULL,
  attempt_status BOOLEAN NOT NULL DEFAULT false,
  round2_status BOOLEAN NOT NULL DEFAULT false
);

-- Questions
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('a','b','c','d'))
);

-- Team question assignments
CREATE TABLE IF NOT EXISTS team_questions (
  team_id UUID NOT NULL REFERENCES teams(id),
  question_ids UUID[] NOT NULL,
  PRIMARY KEY (team_id)
);

-- Attempts
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL UNIQUE REFERENCES teams(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  score INTEGER,
  total_correct INTEGER,
  total_wrong INTEGER,
  completion_time INTEGER,
  ip_address TEXT NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attempts_score ON attempts (score DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_completion_time ON attempts (completion_time ASC);
CREATE INDEX IF NOT EXISTS idx_attempts_end_time ON attempts (end_time);
CREATE INDEX IF NOT EXISTS idx_teams_attempt_status ON teams (attempt_status);

