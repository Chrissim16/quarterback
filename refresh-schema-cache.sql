-- Refresh PostgREST schema cache
-- This forces PostgREST to refresh its schema cache without making changes

-- Query each table to refresh the schema cache
SELECT 1 FROM quarters LIMIT 1;
SELECT 1 FROM plan_items LIMIT 1;
SELECT 1 FROM team_members LIMIT 1;
SELECT 1 FROM holidays LIMIT 1;
SELECT 1 FROM countries LIMIT 1;
SELECT 1 FROM settings LIMIT 1;
SELECT 1 FROM proposals LIMIT 1;

-- Verify the plan_items table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'plan_items' 
ORDER BY ordinal_position;