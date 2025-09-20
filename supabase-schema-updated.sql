-- Updated Quarterback Database Schema for Supabase
-- Run this in your Supabase SQL Editor to add missing fields for enhanced assignment engine

-- Add missing fields to plan_items table
ALTER TABLE plan_items 
ADD COLUMN IF NOT EXISTS required_skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS dependencies TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS blockers TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS estimated_complexity TEXT DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS preferred_assignees TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS avoid_assignees TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS max_concurrent_assignments INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS deadline DATE,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add missing fields to team_members table
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS quarter_id TEXT REFERENCES quarters(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS skill_levels JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{}';

-- Add missing fields to holidays table
ALTER TABLE holidays 
ADD COLUMN IF NOT EXISTS quarter_id TEXT REFERENCES quarters(id) ON DELETE CASCADE;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_plan_items_required_skills ON plan_items USING GIN(required_skills);
CREATE INDEX IF NOT EXISTS idx_plan_items_priority ON plan_items(priority);
CREATE INDEX IF NOT EXISTS idx_plan_items_deadline ON plan_items(deadline);
CREATE INDEX IF NOT EXISTS idx_team_members_quarter_id ON team_members(quarter_id);
CREATE INDEX IF NOT EXISTS idx_team_members_skills ON team_members USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_holidays_quarter_id ON holidays(quarter_id);

-- Update existing indexes if needed
DROP INDEX IF EXISTS idx_holidays_quarter_id;
CREATE INDEX IF NOT EXISTS idx_holidays_quarter_id ON holidays(quarter_id);

-- Add constraints for new fields
ALTER TABLE plan_items 
ADD CONSTRAINT check_priority CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
ADD CONSTRAINT check_estimated_complexity CHECK (estimated_complexity IN ('Simple', 'Medium', 'Complex', 'Very Complex')),
ADD CONSTRAINT check_max_concurrent_assignments CHECK (max_concurrent_assignments > 0);

-- Update the team_members table to make application nullable (it's optional in the types)
ALTER TABLE team_members ALTER COLUMN application DROP NOT NULL;

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
