-- Complete Quarterback Database Schema for Supabase with Enhanced Assignment Engine
-- Run this in your Supabase SQL Editor

-- Note: Row Level Security is enabled per table below

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quarters table
CREATE TABLE IF NOT EXISTS quarters (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  start_iso DATE NOT NULL,
  end_iso DATE NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plan_items table with enhanced assignment fields
CREATE TABLE IF NOT EXISTS plan_items (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quarter_id TEXT REFERENCES quarters(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  key TEXT NOT NULL,
  title TEXT NOT NULL,
  label TEXT NOT NULL,
  application TEXT NOT NULL,
  base_days DECIMAL(10,2) NOT NULL,
  certainty TEXT NOT NULL,
  adjusted_days DECIMAL(10,2) NOT NULL,
  notes TEXT NOT NULL,
  jira_id TEXT,
  jira_key TEXT,
  jira_status TEXT,
  jira_priority TEXT,
  jira_assignee TEXT,
  jira_sprint TEXT,
  jira_created TIMESTAMP WITH TIME ZONE,
  jira_updated TIMESTAMP WITH TIME ZONE,
  -- Enhanced assignment engine fields
  required_skills TEXT[] DEFAULT '{}',
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  dependencies TEXT[] DEFAULT '{}',
  blockers TEXT[] DEFAULT '{}',
  estimated_complexity TEXT DEFAULT 'Medium' CHECK (estimated_complexity IN ('Simple', 'Medium', 'Complex', 'Very Complex')),
  preferred_assignees TEXT[] DEFAULT '{}',
  avoid_assignees TEXT[] DEFAULT '{}',
  max_concurrent_assignments INTEGER DEFAULT 1 CHECK (max_concurrent_assignments > 0),
  deadline DATE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table with enhanced assignment fields
CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quarter_id TEXT REFERENCES quarters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  application TEXT,
  allocation_pct DECIMAL(5,2) NOT NULL CHECK (allocation_pct >= 0 AND allocation_pct <= 100),
  pto_days INTEGER NOT NULL DEFAULT 0,
  country TEXT,
  -- Enhanced assignment engine fields
  skills TEXT[] DEFAULT '{}',
  skill_levels JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  availability JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create holidays table
CREATE TABLE IF NOT EXISTS holidays (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quarter_id TEXT REFERENCES quarters(id) ON DELETE CASCADE,
  date_iso DATE NOT NULL,
  name TEXT NOT NULL,
  countries TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  certainty_multipliers JSONB NOT NULL DEFAULT '{"Low": 1.5, "Mid": 1.2, "High": 1.0}',
  countries JSONB NOT NULL DEFAULT '[]',
  strict_app_matching BOOLEAN DEFAULT TRUE,
  jira JSONB NOT NULL DEFAULT '{"base_url": "", "username": "", "project_key": "", "is_connected": false, "last_sync": null}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quarter_id TEXT REFERENCES quarters(id) ON DELETE CASCADE,
  generated_at_iso TIMESTAMP WITH TIME ZONE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quarters_user_id ON quarters(user_id);
CREATE INDEX IF NOT EXISTS idx_quarters_is_current ON quarters(is_current);
CREATE INDEX IF NOT EXISTS idx_plan_items_user_id ON plan_items(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_items_quarter_id ON plan_items(quarter_id);
CREATE INDEX IF NOT EXISTS idx_plan_items_required_skills ON plan_items USING GIN(required_skills);
CREATE INDEX IF NOT EXISTS idx_plan_items_priority ON plan_items(priority);
CREATE INDEX IF NOT EXISTS idx_plan_items_deadline ON plan_items(deadline);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_quarter_id ON team_members(quarter_id);
CREATE INDEX IF NOT EXISTS idx_team_members_skills ON team_members USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_holidays_user_id ON holidays(user_id);
CREATE INDEX IF NOT EXISTS idx_holidays_quarter_id ON holidays(quarter_id);
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_user_id ON proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_quarter_id ON proposals(quarter_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quarters_updated_at BEFORE UPDATE ON quarters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plan_items_updated_at BEFORE UPDATE ON plan_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_holidays_updated_at BEFORE UPDATE ON holidays FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarters ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only access their own data)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own quarters" ON quarters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quarters" ON quarters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quarters" ON quarters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own quarters" ON quarters FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own plan_items" ON plan_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plan_items" ON plan_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plan_items" ON plan_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own plan_items" ON plan_items FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own team_members" ON team_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own team_members" ON team_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own team_members" ON team_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own team_members" ON team_members FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own holidays" ON holidays FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own holidays" ON holidays FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own holidays" ON holidays FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own holidays" ON holidays FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own settings" ON settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON settings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own proposals" ON proposals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own proposals" ON proposals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own proposals" ON proposals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own proposals" ON proposals FOR DELETE USING (auth.uid() = user_id);

-- Create a function to get or create user
CREATE OR REPLACE FUNCTION get_or_create_user(user_email TEXT)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Try to get existing user
  SELECT id INTO user_id FROM users WHERE email = user_email;
  
  -- If user doesn't exist, create them
  IF user_id IS NULL THEN
    INSERT INTO users (id, email) VALUES (gen_random_uuid(), user_email) RETURNING id INTO user_id;
  END IF;
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON COLUMN plan_items.required_skills IS 'Array of skills required for this item';
COMMENT ON COLUMN plan_items.priority IS 'Item priority: Low, Medium, High, Critical';
COMMENT ON COLUMN plan_items.dependencies IS 'Array of item IDs this item depends on';
COMMENT ON COLUMN plan_items.blockers IS 'Array of item IDs that block this item';
COMMENT ON COLUMN plan_items.estimated_complexity IS 'Complexity rating: Simple, Medium, Complex, Very Complex';
COMMENT ON COLUMN plan_items.preferred_assignees IS 'Array of preferred team member IDs';
COMMENT ON COLUMN plan_items.avoid_assignees IS 'Array of team member IDs to avoid';
COMMENT ON COLUMN plan_items.max_concurrent_assignments IS 'Maximum number of people who can work on this simultaneously';
COMMENT ON COLUMN plan_items.deadline IS 'ISO date string for deadline';
COMMENT ON COLUMN plan_items.tags IS 'Additional tags for categorization';

COMMENT ON COLUMN team_members.quarter_id IS 'Quarter this member belongs to';
COMMENT ON COLUMN team_members.skills IS 'Array of skill tags';
COMMENT ON COLUMN team_members.skill_levels IS 'Skill proficiency levels as JSONB';
COMMENT ON COLUMN team_members.preferences IS 'Work preferences as JSONB';
COMMENT ON COLUMN team_members.availability IS 'Availability information as JSONB';

COMMENT ON COLUMN holidays.quarter_id IS 'Quarter this holiday belongs to';
