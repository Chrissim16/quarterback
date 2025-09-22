-- Cleanup Script: Remove Countries from Settings Table
-- This script removes the countries column from the settings table
-- since countries are now stored in the dedicated countries table

-- Step 1: Check current settings data
SELECT id, user_id, certainty_multipliers, countries, strict_app_matching, jira
FROM settings
LIMIT 5;

-- Step 2: Remove countries column from settings table
-- Note: This will permanently remove the countries data from settings
ALTER TABLE settings DROP COLUMN IF EXISTS countries;

-- Step 3: Verify the column was removed
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'settings' 
ORDER BY ordinal_position;

-- Step 4: Check that countries table has the data
SELECT COUNT(*) as countries_count FROM countries;
SELECT code, name, region FROM countries ORDER BY name LIMIT 10;

-- Step 5: Verify settings table structure is clean
SELECT id, user_id, certainty_multipliers, strict_app_matching, jira
FROM settings
LIMIT 5;

-- Success message
SELECT 'Settings cleanup completed successfully!' as status;
