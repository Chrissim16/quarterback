-- Safer Cleanup: Update Settings to Remove Countries Data
-- This script updates existing settings records to remove countries data
-- without dropping the column (safer approach)

-- Step 1: Check current settings data
SELECT id, user_id, certainty_multipliers, countries, strict_app_matching, jira
FROM settings
LIMIT 5;

-- Step 2: Update all settings records to remove countries data
UPDATE settings 
SET countries = NULL 
WHERE countries IS NOT NULL;

-- Step 3: Verify countries data was removed
SELECT id, user_id, certainty_multipliers, countries, strict_app_matching, jira
FROM settings
LIMIT 5;

-- Step 4: Check that countries table has the data
SELECT COUNT(*) as countries_count FROM countries;
SELECT code, name, region FROM countries ORDER BY name LIMIT 10;

-- Success message
SELECT 'Settings countries data removed successfully!' as status;
