-- RLS Policies for Countries Table
-- This ensures proper access control for the countries table

-- Enable RLS on countries table
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read active countries
CREATE POLICY "Allow authenticated users to read active countries" ON countries
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Policy: Allow all users (including anonymous) to read active countries
-- This is needed for the app to work without authentication
CREATE POLICY "Allow all users to read active countries" ON countries
    FOR SELECT
    USING (is_active = true);

-- Policy: Only allow authenticated users to insert countries
CREATE POLICY "Allow authenticated users to insert countries" ON countries
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Only allow authenticated users to update countries
CREATE POLICY "Allow authenticated users to update countries" ON countries
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Only allow authenticated users to delete countries
CREATE POLICY "Allow authenticated users to delete countries" ON countries
    FOR DELETE
    TO authenticated
    USING (true);

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'countries'
ORDER BY policyname;
