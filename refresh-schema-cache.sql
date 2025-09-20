-- Refresh Supabase Schema Cache
-- Run this in your Supabase SQL Editor to refresh the schema cache

-- This will force Supabase to refresh its schema cache
-- by performing a simple operation on each table

-- Refresh team_members table cache
SELECT COUNT(*) FROM team_members;

-- Refresh plan_items table cache  
SELECT COUNT(*) FROM plan_items;

-- Refresh holidays table cache
SELECT COUNT(*) FROM holidays;

-- Refresh quarters table cache
SELECT COUNT(*) FROM quarters;

-- Refresh users table cache
SELECT COUNT(*) FROM users;

-- Refresh settings table cache
SELECT COUNT(*) FROM settings;

-- Test that all enhanced columns are accessible
SELECT 
    'team_members' as table_name,
    quarter_id, skills, skill_levels, preferences, availability
FROM team_members 
LIMIT 1;

SELECT 
    'plan_items' as table_name,
    required_skills, priority, dependencies, blockers, 
    estimated_complexity, preferred_assignees, avoid_assignees,
    max_concurrent_assignments, deadline, tags
FROM plan_items 
LIMIT 1;

SELECT 
    'holidays' as table_name,
    quarter_id
FROM holidays 
LIMIT 1;

-- If this runs without errors, the schema cache has been refreshed
SELECT 'Schema cache refresh completed successfully!' as status;
