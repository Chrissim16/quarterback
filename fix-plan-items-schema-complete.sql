-- Fix plan_items table schema - Add all missing enhanced assignment engine columns
-- This ensures the database schema matches what the application expects

-- Add all missing columns for the enhanced assignment engine
ALTER TABLE plan_items 
ADD COLUMN IF NOT EXISTS required_skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
ADD COLUMN IF NOT EXISTS dependencies TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS blockers TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS estimated_complexity TEXT DEFAULT 'Medium' CHECK (estimated_complexity IN ('Simple', 'Medium', 'Complex', 'Very Complex')),
ADD COLUMN IF NOT EXISTS preferred_assignees TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS avoid_assignees TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS max_concurrent_assignments INTEGER DEFAULT 1 CHECK (max_concurrent_assignments > 0),
ADD COLUMN IF NOT EXISTS deadline DATE,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN plan_items.required_skills IS 'Array of required skill tags';
COMMENT ON COLUMN plan_items.priority IS 'Priority level: Low, Medium, High, Critical';
COMMENT ON COLUMN plan_items.dependencies IS 'Array of dependent item IDs';
COMMENT ON COLUMN plan_items.blockers IS 'Array of blocking item IDs';
COMMENT ON COLUMN plan_items.estimated_complexity IS 'Complexity rating: Simple, Medium, Complex, Very Complex';
COMMENT ON COLUMN plan_items.preferred_assignees IS 'Array of preferred team member IDs';
COMMENT ON COLUMN plan_items.avoid_assignees IS 'Array of team member IDs to avoid';
COMMENT ON COLUMN plan_items.max_concurrent_assignments IS 'Maximum number of people who can work on this simultaneously';
COMMENT ON COLUMN plan_items.deadline IS 'ISO date string for deadline';
COMMENT ON COLUMN plan_items.tags IS 'Array of tags for categorization';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_plan_items_priority ON plan_items(priority);
CREATE INDEX IF NOT EXISTS idx_plan_items_deadline ON plan_items(deadline);
CREATE INDEX IF NOT EXISTS idx_plan_items_required_skills ON plan_items USING GIN(required_skills);
CREATE INDEX IF NOT EXISTS idx_plan_items_tags ON plan_items USING GIN(tags);

-- Refresh the schema cache by querying the table
-- This forces PostgREST to refresh its schema cache
SELECT 
    id, 
    title, 
    required_skills,
    priority,
    dependencies,
    blockers,
    estimated_complexity,
    preferred_assignees,
    avoid_assignees,
    max_concurrent_assignments,
    deadline,
    tags
FROM plan_items 
LIMIT 1;

-- Verify all columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'plan_items' 
  AND column_name IN (
    'required_skills', 'priority', 'dependencies', 'blockers',
    'estimated_complexity', 'preferred_assignees', 'avoid_assignees',
    'max_concurrent_assignments', 'deadline', 'tags'
  )
ORDER BY column_name;
