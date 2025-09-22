# Database Schema Sync Guide

## Overview
This guide ensures the TypeScript database schema stays in sync with the actual Supabase database schema.

## Process for Adding New Tables

### 1. Database Changes
1. Create the table in Supabase using SQL
2. Add appropriate RLS policies
3. Test the table with sample data

### 2. TypeScript Schema Updates
1. Update `src/lib/supabase.ts` with the new table definition
2. Add the table to the `Database` interface
3. Include proper `Row`, `Insert`, and `Update` types

### 3. Service Layer Updates
1. Update `src/lib/supabaseDataService.ts` to include the new table in queries
2. Add proper data transformation logic
3. Update error handling if needed

### 4. Type Updates
1. Update `src/types/index.ts` if new types are needed
2. Update `AppState` interface if the new table affects app state

## Schema Validation Checklist

- [ ] Table exists in Supabase
- [ ] RLS policies are properly configured
- [ ] TypeScript schema includes the table
- [ ] Service layer includes the table in queries
- [ ] Data transformation is implemented
- [ ] Error handling is in place
- [ ] Types are properly defined

## Common Issues

1. **Missing Table in Schema**: Causes silent query failures
2. **RLS Not Configured**: Prevents data access
3. **Type Mismatches**: Causes runtime errors
4. **Missing Data Transformation**: Causes data structure issues

## Testing

1. Test queries in Supabase SQL Editor
2. Test with different user contexts
3. Verify data transformation in app
4. Check error handling scenarios
