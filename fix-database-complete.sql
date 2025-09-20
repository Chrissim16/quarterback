-- Complete Database Schema Fix for Quarterback
-- Run this in your Supabase SQL Editor to fix all missing columns

-- First, let's check what columns currently exist
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('team_members', 'plan_items', 'holidays')
ORDER BY table_name, column_name;

-- Add missing columns to team_members table
DO $$ 
BEGIN
    -- Add quarter_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'quarter_id') THEN
        ALTER TABLE team_members ADD COLUMN quarter_id TEXT REFERENCES quarters(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added quarter_id to team_members';
    END IF;
    
    -- Add skills if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'skills') THEN
        ALTER TABLE team_members ADD COLUMN skills TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added skills to team_members';
    END IF;
    
    -- Add skill_levels if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'skill_levels') THEN
        ALTER TABLE team_members ADD COLUMN skill_levels JSONB DEFAULT '{}';
        RAISE NOTICE 'Added skill_levels to team_members';
    END IF;
    
    -- Add preferences if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'preferences') THEN
        ALTER TABLE team_members ADD COLUMN preferences JSONB DEFAULT '{}';
        RAISE NOTICE 'Added preferences to team_members';
    END IF;
    
    -- Add availability if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'availability') THEN
        ALTER TABLE team_members ADD COLUMN availability JSONB DEFAULT '{}';
        RAISE NOTICE 'Added availability to team_members';
    END IF;
END $$;

-- Add missing columns to plan_items table
DO $$ 
BEGIN
    -- Add required_skills if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plan_items' AND column_name = 'required_skills') THEN
        ALTER TABLE plan_items ADD COLUMN required_skills TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added required_skills to plan_items';
    END IF;
    
    -- Add priority if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plan_items' AND column_name = 'priority') THEN
        ALTER TABLE plan_items ADD COLUMN priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical'));
        RAISE NOTICE 'Added priority to plan_items';
    END IF;
    
    -- Add dependencies if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plan_items' AND column_name = 'dependencies') THEN
        ALTER TABLE plan_items ADD COLUMN dependencies TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added dependencies to plan_items';
    END IF;
    
    -- Add blockers if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plan_items' AND column_name = 'blockers') THEN
        ALTER TABLE plan_items ADD COLUMN blockers TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added blockers to plan_items';
    END IF;
    
    -- Add estimated_complexity if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plan_items' AND column_name = 'estimated_complexity') THEN
        ALTER TABLE plan_items ADD COLUMN estimated_complexity TEXT DEFAULT 'Medium' CHECK (estimated_complexity IN ('Simple', 'Medium', 'Complex', 'Very Complex'));
        RAISE NOTICE 'Added estimated_complexity to plan_items';
    END IF;
    
    -- Add preferred_assignees if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plan_items' AND column_name = 'preferred_assignees') THEN
        ALTER TABLE plan_items ADD COLUMN preferred_assignees TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added preferred_assignees to plan_items';
    END IF;
    
    -- Add avoid_assignees if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plan_items' AND column_name = 'avoid_assignees') THEN
        ALTER TABLE plan_items ADD COLUMN avoid_assignees TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added avoid_assignees to plan_items';
    END IF;
    
    -- Add max_concurrent_assignments if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plan_items' AND column_name = 'max_concurrent_assignments') THEN
        ALTER TABLE plan_items ADD COLUMN max_concurrent_assignments INTEGER DEFAULT 1 CHECK (max_concurrent_assignments > 0);
        RAISE NOTICE 'Added max_concurrent_assignments to plan_items';
    END IF;
    
    -- Add deadline if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plan_items' AND column_name = 'deadline') THEN
        ALTER TABLE plan_items ADD COLUMN deadline DATE;
        RAISE NOTICE 'Added deadline to plan_items';
    END IF;
    
    -- Add tags if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plan_items' AND column_name = 'tags') THEN
        ALTER TABLE plan_items ADD COLUMN tags TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added tags to plan_items';
    END IF;
END $$;

-- Add missing column to holidays table
DO $$ 
BEGIN
    -- Add quarter_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'holidays' AND column_name = 'quarter_id') THEN
        ALTER TABLE holidays ADD COLUMN quarter_id TEXT REFERENCES quarters(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added quarter_id to holidays';
    END IF;
END $$;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_team_members_quarter_id ON team_members(quarter_id);
CREATE INDEX IF NOT EXISTS idx_team_members_skills ON team_members USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_plan_items_required_skills ON plan_items USING GIN(required_skills);
CREATE INDEX IF NOT EXISTS idx_plan_items_priority ON plan_items(priority);
CREATE INDEX IF NOT EXISTS idx_plan_items_deadline ON plan_items(deadline);
CREATE INDEX IF NOT EXISTS idx_holidays_quarter_id ON holidays(quarter_id);

-- Final verification - show all columns that should exist
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('team_members', 'plan_items', 'holidays')
    AND column_name IN (
        'quarter_id', 'skills', 'skill_levels', 'preferences', 'availability',
        'required_skills', 'priority', 'dependencies', 'blockers', 
        'estimated_complexity', 'preferred_assignees', 'avoid_assignees',
        'max_concurrent_assignments', 'deadline', 'tags'
    )
ORDER BY table_name, column_name;

-- Test that we can select from the tables with all columns
SELECT 'team_members test' as test, COUNT(*) as count FROM team_members;
SELECT 'plan_items test' as test, COUNT(*) as count FROM plan_items;
SELECT 'holidays test' as test, COUNT(*) as count FROM holidays;
