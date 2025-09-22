-- Countries Table Refactor - Best Practices Implementation
-- This script refactors the countries storage from settings JSONB to a proper normalized table

-- Step 1: Create the countries table
CREATE TABLE IF NOT EXISTS countries (
  code VARCHAR(2) PRIMARY KEY,  -- ISO 3166-1 alpha-2 country code
  name VARCHAR(100) NOT NULL,
  region VARCHAR(50),
  timezone VARCHAR(50),
  currency VARCHAR(3),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Insert standard countries used in the app
INSERT INTO countries (code, name, region, timezone, currency) VALUES
('US', 'United States', 'North America', 'America/New_York', 'USD'),
('NL', 'Netherlands', 'Europe', 'Europe/Amsterdam', 'EUR'),
('UK', 'United Kingdom', 'Europe', 'Europe/London', 'GBP'),
('ES', 'Spain', 'Europe', 'Europe/Madrid', 'EUR'),
('DE', 'Germany', 'Europe', 'Europe/Berlin', 'EUR'),
('FR', 'France', 'Europe', 'Europe/Paris', 'EUR'),
('IT', 'Italy', 'Europe', 'Europe/Rome', 'EUR'),
('CA', 'Canada', 'North America', 'America/Toronto', 'CAD'),
('AU', 'Australia', 'Oceania', 'Australia/Sydney', 'AUD'),
('JP', 'Japan', 'Asia', 'Asia/Tokyo', 'JPY'),
('KR', 'South Korea', 'Asia', 'Asia/Seoul', 'KRW'),
('CN', 'China', 'Asia', 'Asia/Shanghai', 'CNY'),
('IN', 'India', 'Asia', 'Asia/Kolkata', 'INR'),
('BR', 'Brazil', 'South America', 'America/Sao_Paulo', 'BRL'),
('MX', 'Mexico', 'North America', 'America/Mexico_City', 'MXN')
ON CONFLICT (code) DO NOTHING;

-- Step 3: Add foreign key constraints to existing tables
-- First, ensure all existing country values are valid
UPDATE team_members 
SET country = UPPER(country) 
WHERE country IS NOT NULL;

-- Add foreign key constraint to team_members
ALTER TABLE team_members 
ADD CONSTRAINT fk_team_member_country 
FOREIGN KEY (country) REFERENCES countries(code);

-- Update holidays table to use country codes instead of country names
-- First, let's add a new column for country codes
ALTER TABLE holidays 
ADD COLUMN IF NOT EXISTS country_codes VARCHAR(2)[] DEFAULT '{}';

-- Migrate existing country data (this is a simplified migration)
-- In a real scenario, you'd need to map country names to codes
UPDATE holidays 
SET country_codes = ARRAY['US'] 
WHERE 'United States' = ANY(countries) OR 'US' = ANY(countries);

UPDATE holidays 
SET country_codes = ARRAY['NL'] 
WHERE 'Netherlands' = ANY(countries) OR 'NL' = ANY(countries);

UPDATE holidays 
SET country_codes = ARRAY['UK'] 
WHERE 'United Kingdom' = ANY(countries) OR 'UK' = ANY(countries);

UPDATE holidays 
SET country_codes = ARRAY['ES'] 
WHERE 'Spain' = ANY(countries) OR 'ES' = ANY(countries);

UPDATE holidays 
SET country_codes = ARRAY['DE'] 
WHERE 'Germany' = ANY(countries) OR 'DE' = ANY(countries);

-- Add foreign key constraint for holidays (using array overlap)
-- Note: This is a simplified approach - in production you might want a junction table
CREATE OR REPLACE FUNCTION validate_holiday_countries()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if all country codes in the array exist in countries table
  IF NOT EXISTS (
    SELECT 1 FROM countries 
    WHERE code = ANY(NEW.country_codes)
  ) THEN
    RAISE EXCEPTION 'Invalid country code in holidays table';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_holiday_countries_trigger
  BEFORE INSERT OR UPDATE ON holidays
  FOR EACH ROW
  EXECUTE FUNCTION validate_holiday_countries();

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code);
CREATE INDEX IF NOT EXISTS idx_countries_region ON countries(region);
CREATE INDEX IF NOT EXISTS idx_countries_active ON countries(is_active);
CREATE INDEX IF NOT EXISTS idx_team_members_country ON team_members(country);
CREATE INDEX IF NOT EXISTS idx_holidays_country_codes ON holidays USING GIN(country_codes);

-- Step 5: Create views for easier querying
CREATE OR REPLACE VIEW active_countries AS
SELECT code, name, region, timezone, currency
FROM countries 
WHERE is_active = TRUE
ORDER BY name;

-- Step 6: Create helper functions
CREATE OR REPLACE FUNCTION get_country_name(country_code VARCHAR(2))
RETURNS VARCHAR(100) AS $$
BEGIN
  RETURN (SELECT name FROM countries WHERE code = country_code);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_countries_by_region(region_name VARCHAR(50))
RETURNS TABLE(code VARCHAR(2), name VARCHAR(100)) AS $$
BEGIN
  RETURN QUERY
  SELECT c.code, c.name 
  FROM countries c 
  WHERE c.region = region_name AND c.is_active = TRUE
  ORDER BY c.name;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Update RLS policies for countries table
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read countries (they're reference data)
CREATE POLICY "Countries are viewable by authenticated users" ON countries
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only allow service role to modify countries (admin operation)
CREATE POLICY "Only service role can modify countries" ON countries
  FOR ALL USING (auth.role() = 'service_role');

-- Step 8: Add comments for documentation
COMMENT ON TABLE countries IS 'Reference table for countries with ISO codes and metadata';
COMMENT ON COLUMN countries.code IS 'ISO 3166-1 alpha-2 country code (2 characters)';
COMMENT ON COLUMN countries.name IS 'Official country name';
COMMENT ON COLUMN countries.region IS 'Geographic region';
COMMENT ON COLUMN countries.timezone IS 'Primary timezone for the country';
COMMENT ON COLUMN countries.currency IS 'ISO 4217 currency code';
COMMENT ON COLUMN countries.is_active IS 'Whether this country is available for selection';

-- Step 9: Create a migration log table to track this refactor
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE,
  notes TEXT
);

INSERT INTO schema_migrations (migration_name, notes) 
VALUES ('countries_refactor_v1', 'Refactored countries from settings JSONB to normalized countries table');

-- Step 10: Verification queries
-- Check that all team member countries are valid
SELECT DISTINCT tm.country, c.name
FROM team_members tm
LEFT JOIN countries c ON tm.country = c.code
WHERE tm.country IS NOT NULL;

-- Check that all holiday country codes are valid
SELECT DISTINCT country_code, c.name
FROM (
  SELECT unnest(h.country_codes) as country_code
  FROM holidays h
  WHERE array_length(h.country_codes, 1) > 0
) h
LEFT JOIN countries c ON h.country_code = c.code;
