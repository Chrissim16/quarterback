-- Fix Missing Columns in Supabase Database
-- Run this in your Supabase SQL Editor

-- Add missing columns to team_members table
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS quarter_id TEXT REFERENCES quarters(id) ON DELETE CASCADE;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS skill_levels JSONB DEFAULT '{}';
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{}';

-- Add missing columns to plan_items table
ALTER TABLE plan_items ADD COLUMN IF NOT EXISTS required_skills TEXT[] DEFAULT '{}';
ALTER TABLE plan_items ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical'));
ALTER TABLE plan_items ADD COLUMN IF NOT EXISTS dependencies TEXT[] DEFAULT '{}';
ALTER TABLE plan_items ADD COLUMN IF NOT EXISTS blockers TEXT[] DEFAULT '{}';
ALTER TABLE plan_items ADD COLUMN IF NOT EXISTS estimated_complexity TEXT DEFAULT 'Medium' CHECK (estimated_complexity IN ('Simple', 'Medium', 'Complex', 'Very Complex'));
ALTER TABLE plan_items ADD COLUMN IF NOT EXISTS preferred_assignees TEXT[] DEFAULT '{}';
ALTER TABLE plan_items ADD COLUMN IF NOT EXISTS avoid_assignees TEXT[] DEFAULT '{}';
ALTER TABLE plan_items ADD COLUMN IF NOT EXISTS max_concurrent_assignments INTEGER DEFAULT 1 CHECK (max_concurrent_assignments > 0);
ALTER TABLE plan_items ADD COLUMN IF NOT EXISTS deadline DATE;
ALTER TABLE plan_items ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add missing column to holidays table
ALTER TABLE holidays ADD COLUMN IF NOT EXISTS quarter_id TEXT REFERENCES quarters(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_members_quarter_id ON team_members(quarter_id);
CREATE INDEX IF NOT EXISTS idx_team_members_skills ON team_members USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_plan_items_required_skills ON plan_items USING GIN(required_skills);
CREATE INDEX IF NOT EXISTS idx_plan_items_priority ON plan_items(priority);
CREATE INDEX IF NOT EXISTS idx_plan_items_deadline ON plan_items(deadline);
CREATE INDEX IF NOT EXISTS idx_holidays_quarter_id ON holidays(quarter_id);

-- Verify the changes
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('team_members', 'plan_items', 'holidays')
    AND column_name IN ('quarter_id', 'skills', 'required_skills', 'priority')
ORDER BY table_name, column_name;
