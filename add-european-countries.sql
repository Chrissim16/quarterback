-- Add All European Countries to Countries Table
-- This script adds comprehensive European countries with proper metadata

INSERT INTO countries (code, name, region, timezone, currency, is_active) VALUES
-- Western Europe
('AD', 'Andorra', 'Europe', 'Europe/Andorra', 'EUR', true),
('AT', 'Austria', 'Europe', 'Europe/Vienna', 'EUR', true),
('BE', 'Belgium', 'Europe', 'Europe/Brussels', 'EUR', true),
('CH', 'Switzerland', 'Europe', 'Europe/Zurich', 'CHF', true),
('DE', 'Germany', 'Europe', 'Europe/Berlin', 'EUR', true),
('FR', 'France', 'Europe', 'Europe/Paris', 'EUR', true),
('IE', 'Ireland', 'Europe', 'Europe/Dublin', 'EUR', true),
('LI', 'Liechtenstein', 'Europe', 'Europe/Vaduz', 'CHF', true),
('LU', 'Luxembourg', 'Europe', 'Europe/Luxembourg', 'EUR', true),
('MC', 'Monaco', 'Europe', 'Europe/Monaco', 'EUR', true),
('NL', 'Netherlands', 'Europe', 'Europe/Amsterdam', 'EUR', true),
('UK', 'United Kingdom', 'Europe', 'Europe/London', 'GBP', true),

-- Northern Europe
('DK', 'Denmark', 'Europe', 'Europe/Copenhagen', 'DKK', true),
('FI', 'Finland', 'Europe', 'Europe/Helsinki', 'EUR', true),
('IS', 'Iceland', 'Europe', 'Atlantic/Reykjavik', 'ISK', true),
('NO', 'Norway', 'Europe', 'Europe/Oslo', 'NOK', true),
('SE', 'Sweden', 'Europe', 'Europe/Stockholm', 'SEK', true),

-- Southern Europe
('AL', 'Albania', 'Europe', 'Europe/Tirane', 'ALL', true),
('BA', 'Bosnia and Herzegovina', 'Europe', 'Europe/Sarajevo', 'BAM', true),
('BG', 'Bulgaria', 'Europe', 'Europe/Sofia', 'BGN', true),
('CY', 'Cyprus', 'Europe', 'Asia/Nicosia', 'EUR', true),
('ES', 'Spain', 'Europe', 'Europe/Madrid', 'EUR', true),
('GR', 'Greece', 'Europe', 'Europe/Athens', 'EUR', true),
('HR', 'Croatia', 'Europe', 'Europe/Zagreb', 'EUR', true),
('IT', 'Italy', 'Europe', 'Europe/Rome', 'EUR', true),
('ME', 'Montenegro', 'Europe', 'Europe/Podgorica', 'EUR', true),
('MK', 'North Macedonia', 'Europe', 'Europe/Skopje', 'MKD', true),
('MT', 'Malta', 'Europe', 'Europe/Malta', 'EUR', true),
('PT', 'Portugal', 'Europe', 'Europe/Lisbon', 'EUR', true),
('RS', 'Serbia', 'Europe', 'Europe/Belgrade', 'RSD', true),
('SI', 'Slovenia', 'Europe', 'Europe/Ljubljana', 'EUR', true),
('SM', 'San Marino', 'Europe', 'Europe/San_Marino', 'EUR', true),
('VA', 'Vatican City', 'Europe', 'Europe/Vatican', 'EUR', true),
('XK', 'Kosovo', 'Europe', 'Europe/Belgrade', 'EUR', true),

-- Eastern Europe
('BY', 'Belarus', 'Europe', 'Europe/Minsk', 'BYN', true),
('CZ', 'Czech Republic', 'Europe', 'Europe/Prague', 'CZK', true),
('EE', 'Estonia', 'Europe', 'Europe/Tallinn', 'EUR', true),
('HU', 'Hungary', 'Europe', 'Europe/Budapest', 'HUF', true),
('LT', 'Lithuania', 'Europe', 'Europe/Vilnius', 'EUR', true),
('LV', 'Latvia', 'Europe', 'Europe/Riga', 'EUR', true),
('MD', 'Moldova', 'Europe', 'Europe/Chisinau', 'MDL', true),
('PL', 'Poland', 'Europe', 'Europe/Warsaw', 'PLN', true),
('RO', 'Romania', 'Europe', 'Europe/Bucharest', 'RON', true),
('RU', 'Russia', 'Europe', 'Europe/Moscow', 'RUB', true),
('SK', 'Slovakia', 'Europe', 'Europe/Bratislava', 'EUR', true),
('UA', 'Ukraine', 'Europe', 'Europe/Kiev', 'UAH', true),

-- Transcontinental (Europe/Asia)
('AZ', 'Azerbaijan', 'Europe', 'Asia/Baku', 'AZN', true),
('GE', 'Georgia', 'Europe', 'Asia/Tbilisi', 'GEL', true),
('TR', 'Turkey', 'Europe', 'Europe/Istanbul', 'TRY', true),

-- Special Territories
('AX', 'Åland Islands', 'Europe', 'Europe/Mariehamn', 'EUR', true),
('FO', 'Faroe Islands', 'Europe', 'Atlantic/Faroe', 'DKK', true),
('GG', 'Guernsey', 'Europe', 'Europe/Guernsey', 'GBP', true),
('GI', 'Gibraltar', 'Europe', 'Europe/Gibraltar', 'GBP', true),
('IM', 'Isle of Man', 'Europe', 'Europe/Isle_of_Man', 'GBP', true),
('JE', 'Jersey', 'Europe', 'Europe/Jersey', 'GBP', true),
('SJ', 'Svalbard and Jan Mayen', 'Europe', 'Arctic/Longyearbyen', 'NOK', true)

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  region = EXCLUDED.region,
  timezone = EXCLUDED.timezone,
  currency = EXCLUDED.currency,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verify the insertion
SELECT COUNT(*) as total_european_countries FROM countries WHERE region = 'Europe';
SELECT code, name, currency FROM countries WHERE region = 'Europe' ORDER BY name;

-- Show summary by subregion
SELECT 
  CASE 
    WHEN code IN ('AD', 'AT', 'BE', 'CH', 'DE', 'FR', 'IE', 'LI', 'LU', 'MC', 'NL', 'UK') THEN 'Western Europe'
    WHEN code IN ('DK', 'FI', 'IS', 'NO', 'SE') THEN 'Northern Europe'
    WHEN code IN ('AL', 'BA', 'BG', 'CY', 'ES', 'GR', 'HR', 'IT', 'ME', 'MK', 'MT', 'PT', 'RS', 'SI', 'SM', 'VA', 'XK') THEN 'Southern Europe'
    WHEN code IN ('BY', 'CZ', 'EE', 'HU', 'LT', 'LV', 'MD', 'PL', 'RO', 'RU', 'SK', 'UA') THEN 'Eastern Europe'
    WHEN code IN ('AZ', 'GE', 'TR') THEN 'Transcontinental'
    ELSE 'Special Territories'
  END as subregion,
  COUNT(*) as country_count
FROM countries 
WHERE region = 'Europe'
GROUP BY 
  CASE 
    WHEN code IN ('AD', 'AT', 'BE', 'CH', 'DE', 'FR', 'IE', 'LI', 'LU', 'MC', 'NL', 'UK') THEN 'Western Europe'
    WHEN code IN ('DK', 'FI', 'IS', 'NO', 'SE') THEN 'Northern Europe'
    WHEN code IN ('AL', 'BA', 'BG', 'CY', 'ES', 'GR', 'HR', 'IT', 'ME', 'MK', 'MT', 'PT', 'RS', 'SI', 'SM', 'VA', 'XK') THEN 'Southern Europe'
    WHEN code IN ('BY', 'CZ', 'EE', 'HU', 'LT', 'LV', 'MD', 'PL', 'RO', 'RU', 'SK', 'UA') THEN 'Eastern Europe'
    WHEN code IN ('AZ', 'GE', 'TR') THEN 'Transcontinental'
    ELSE 'Special Territories'
  END
ORDER BY country_count DESC;
