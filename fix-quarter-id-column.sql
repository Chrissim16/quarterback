-- Quick Fix for Missing quarter_id Column
-- Run this in your Supabase SQL Editor

-- Add quarter_id to team_members table
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS quarter_id TEXT REFERENCES quarters(id) ON DELETE CASCADE;

-- Add quarter_id to holidays table  
ALTER TABLE holidays ADD COLUMN IF NOT EXISTS quarter_id TEXT REFERENCES quarters(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_members_quarter_id ON team_members(quarter_id);
CREATE INDEX IF NOT EXISTS idx_holidays_quarter_id ON holidays(quarter_id);

-- Verify the columns were added
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('team_members', 'holidays')
    AND column_name = 'quarter_id'
ORDER BY table_name;

-- Test that we can select from the tables
SELECT 'team_members test' as test, COUNT(*) as count FROM team_members;
SELECT 'holidays test' as test, COUNT(*) as count FROM holidays;
