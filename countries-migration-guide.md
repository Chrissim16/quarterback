# Countries Refactor Migration Guide

## Overview
This guide outlines the migration from storing countries in the `settings` table as JSONB to a proper normalized `countries` table.

## Database Changes

### 1. New Countries Table
- **Table**: `countries`
- **Primary Key**: `code` (VARCHAR(2)) - ISO 3166-1 alpha-2
- **Columns**: name, region, timezone, currency, is_active
- **Foreign Keys**: Added to `team_members.country` and `holidays.country_codes`

### 2. Data Migration
- Countries moved from `settings.countries` JSONB to `countries` table
- Existing country references updated to use ISO codes
- Validation triggers added for data integrity

## Code Changes Required

### 1. Update Types
```typescript
// Add to types/index.ts
export interface Country {
  code: string;        // ISO 3166-1 alpha-2
  name: string;
  region?: string;
  timezone?: string;
  currency?: string;
  isActive: boolean;
}

// Update existing types
export interface TeamMember {
  // ... existing fields
  country: string;     // Now stores ISO code instead of full name
}

export interface Holiday {
  // ... existing fields
  countryCodes: string[];  // Array of ISO codes instead of names
}
```

### 2. Update Supabase Service
```typescript
// Add to supabaseService.ts
async getCountries(): Promise<Country[]> {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('is_active', true)
    .order('name');
  
  if (error) throw new Error(`Failed to get countries: ${error.message}`);
  return data || [];
}

async createCountry(country: Omit<Country, 'code'>): Promise<Country> {
  const { data, error } = await supabase
    .from('countries')
    .insert(country)
    .select()
    .single();
  
  if (error) throw new Error(`Failed to create country: ${error.message}`);
  return data;
}
```

### 3. Update App Store
```typescript
// Update useAppStore.ts
interface AppState {
  // ... existing fields
  countries: Country[];  // Add countries array
}

// Add actions
interface AppActions {
  // ... existing actions
  loadCountries: () => Promise<void>;
  addCountry: (country: Omit<Country, 'code'>) => Promise<boolean>;
  updateCountry: (code: string, updates: Partial<Country>) => Promise<boolean>;
  removeCountry: (code: string) => Promise<boolean>;
}
```

### 4. Update Components
```typescript
// Update CountriesSettings.tsx
const CountriesSettings = () => {
  const { countries, loadCountries, addCountry, updateCountry, removeCountry } = useAppStore();
  
  // Load countries on mount
  useEffect(() => {
    loadCountries();
  }, []);
  
  // Update country selection logic to use codes
  const handleCountrySelect = (countryCode: string) => {
    // Use country code instead of full name
  };
};
```

### 5. Update Country Utilities
```typescript
// Update lib/countries.ts
export const getCountryName = (code: string, countries: Country[]): string => {
  const country = countries.find(c => c.code === code);
  return country?.name || code;
};

export const getCountriesByRegion = (region: string, countries: Country[]): Country[] => {
  return countries.filter(c => c.region === region && c.isActive);
};

export const formatCountryDisplay = (code: string, countries: Country[]): string => {
  const country = countries.find(c => c.code === code);
  return country ? `${country.name} (${code})` : code;
};
```

## Migration Steps

### 1. Run Database Migration
```sql
-- Execute countries-refactor.sql in Supabase SQL Editor
-- This will create the countries table and migrate data
```

### 2. Update App Code
1. Update types to include Country interface
2. Add countries to app store state
3. Update Supabase service with country operations
4. Update components to use new country structure
5. Update country utilities and helpers

### 3. Test Migration
1. Verify countries load correctly
2. Test country selection in team members
3. Test holiday country associations
4. Verify data integrity constraints

### 4. Clean Up
1. Remove countries from settings table (optional)
2. Update documentation
3. Remove old country-related code

## Benefits of This Refactor

1. **Data Integrity**: Foreign key constraints prevent invalid country references
2. **Performance**: Indexed lookups instead of JSONB searches
3. **Scalability**: Easy to add country metadata (timezone, currency, etc.)
4. **Maintainability**: Centralized country management
5. **Standards Compliance**: Uses ISO country codes
6. **Query Performance**: Better joins and filtering capabilities

## Rollback Plan

If issues arise, you can rollback by:
1. Reverting code changes
2. Dropping foreign key constraints
3. Restoring countries to settings JSONB
4. Running rollback SQL script

## Testing Checklist

- [ ] Countries load from new table
- [ ] Team member country selection works
- [ ] Holiday country associations work
- [ ] Country validation prevents invalid codes
- [ ] Performance is improved
- [ ] Data integrity is maintained
