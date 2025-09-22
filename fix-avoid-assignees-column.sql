-- Fix missing avoid_assignees column in plan_items table
-- This script adds the missing column and refreshes the schema cache

-- Add the missing column if it doesn't exist
ALTER TABLE plan_items 
ADD COLUMN IF NOT EXISTS avoid_assignees TEXT[] DEFAULT '{}';

-- Add a comment for documentation
COMMENT ON COLUMN plan_items.avoid_assignees IS 'Array of team member IDs to avoid';

-- Refresh the schema cache by querying the table
-- This forces PostgREST to refresh its schema cache
SELECT 
    id, 
    title, 
    avoid_assignees,
    preferred_assignees,
    estimated_complexity,
    max_concurrent_assignments,
    deadline
FROM plan_items 
LIMIT 1;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'plan_items' 
  AND column_name = 'avoid_assignees';
