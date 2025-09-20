-- Verify Database Schema - Run this first to see what's missing
-- This will show you exactly what columns exist in your database

-- Check team_members table structure
SELECT 
    'team_members' as table_name,
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'team_members'
ORDER BY ordinal_position;

-- Check plan_items table structure  
SELECT 
    'plan_items' as table_name,
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'plan_items'
ORDER BY ordinal_position;

-- Check holidays table structure
SELECT 
    'holidays' as table_name,
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'holidays'
ORDER BY ordinal_position;

-- Check if specific columns exist
SELECT 
    expected.table_name,
    expected.column_name,
    CASE 
        WHEN c.column_name IS NOT NULL THEN 'EXISTS'
        ELSE 'MISSING'
    END as status
FROM (
    SELECT 'team_members' as table_name, 'quarter_id' as column_name
    UNION ALL SELECT 'team_members', 'skills'
    UNION ALL SELECT 'team_members', 'skill_levels'
    UNION ALL SELECT 'team_members', 'preferences'
    UNION ALL SELECT 'team_members', 'availability'
    UNION ALL SELECT 'plan_items', 'required_skills'
    UNION ALL SELECT 'plan_items', 'priority'
    UNION ALL SELECT 'plan_items', 'dependencies'
    UNION ALL SELECT 'plan_items', 'blockers'
    UNION ALL SELECT 'plan_items', 'estimated_complexity'
    UNION ALL SELECT 'plan_items', 'preferred_assignees'
    UNION ALL SELECT 'plan_items', 'avoid_assignees'
    UNION ALL SELECT 'plan_items', 'max_concurrent_assignments'
    UNION ALL SELECT 'plan_items', 'deadline'
    UNION ALL SELECT 'plan_items', 'tags'
    UNION ALL SELECT 'holidays', 'quarter_id'
) expected
LEFT JOIN information_schema.columns c 
    ON c.table_name = expected.table_name 
    AND c.column_name = expected.column_name
ORDER BY expected.table_name, expected.column_name;
