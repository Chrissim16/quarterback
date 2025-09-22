import React from 'react'

// Core data types
export type ISO2 = string // length 2, uppercase

export interface Country {
  code: ISO2 // e.g., 'NL' - ISO 3166-1 alpha-2
  name: string // e.g., 'Netherlands'
  region?: string // e.g., 'Europe'
  timezone?: string // e.g., 'Europe/Amsterdam'
  currency?: string // e.g., 'EUR'
  isActive?: boolean // Whether this country is available for selection
}

export interface PlanItem {
  id: string
  quarterId: string // Quarter this item belongs to
  type: 'Feature' | 'Story'
  key?: string
  title: string
  label?: string
  application?: string
  baseDays?: number
  certainty?: 'Low' | 'Mid' | 'High'
  adjustedDays?: number
  notes?: string
  // Jira integration fields
  jiraId?: string
  jiraKey?: string
  jiraStatus?: string
  jiraPriority?: string
  jiraAssignee?: string
  jiraSprint?: string
  jiraCreated?: string
  jiraUpdated?: string
  // Enhanced assignment engine fields
  requiredSkills?: string[] // Skills required for this item
  priority?: 'Low' | 'Medium' | 'High' | 'Critical' // Item priority
  dependencies?: string[] // Array of item IDs this item depends on
  blockers?: string[] // Array of item IDs that block this item
  estimatedComplexity?: 'Simple' | 'Medium' | 'Complex' | 'Very Complex'
  preferredAssignees?: string[] // Array of preferred team member IDs
  avoidAssignees?: string[] // Array of team member IDs to avoid
  maxConcurrentAssignments?: number // Maximum number of people who can work on this simultaneously
  deadline?: string // ISO date string for deadline
  tags?: string[] // Additional tags for categorization
}

export interface TeamMember {
  id: string
  quarterId: string // Quarter this member belongs to
  name: string
  country?: ISO2 // replaces location
  application?: string
  allocationPct?: number
  ptoDays?: number
  // Enhanced assignment engine fields
  skills?: string[] // Array of skill tags (e.g., ['React', 'TypeScript', 'Backend'])
  skillLevels?: Record<string, 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'> // Skill proficiency levels
  preferences?: {
    maxConcurrentItems?: number // Maximum number of items to work on simultaneously
    preferredItemTypes?: ('Feature' | 'Story')[] // Preferred work types
    avoidItemTypes?: ('Feature' | 'Story')[] // Work types to avoid
    maxDailyHours?: number // Maximum hours per day
  }
  availability?: {
    startDate?: string // When they become available
    endDate?: string // When they become unavailable
    workingDays?: number[] // Days of week (0=Sunday, 1=Monday, etc.)
  }
}

export interface Holiday {
  id: string
  quarterId: string // Quarter this holiday belongs to
  dateISO: string
  name: string
  countryCodes: ISO2[] // Array of ISO country codes; empty = global
}

// Store state types
export interface Quarter {
  startISO: string
  endISO: string
}

export interface QuarterWithId extends Quarter {
  id: string
  name: string
  description?: string
  label?: string // Jira label for this quarter (e.g., "25Q4")
}

export interface Settings {
  certaintyMultipliers: {
    Low: number
    Mid: number
    High: number
  }
  countries: Country[] // centrally maintained list, sorted by code
  strictAppMatching: boolean // default true; when false, allow fallback behavior
  jira?: {
    baseUrl: string
    username: string
    projectKey: string
    isConnected: boolean
    lastSync?: string
  }
}

export type Selection = 'plan' | 'team' | 'settings'

export interface AppState {
  quarters: QuarterWithId[]
  currentQuarterId: string | null // null means no quarter selected
  team: TeamMember[]
  holidays: Holiday[]
  items: PlanItem[]
  countries: Country[] // Reference data for countries
  settings: Settings
  selection: Selection
  proposal?: {
    generatedAtISO: string
    items: ProposalItem[]
  }
}

// Component prop types
export interface LayoutProps {
  children: React.ReactNode
}

export interface PageProps {
  className?: string
}

// Business logic constants
export const CAPACITY_FORMULA =
  'workingDays * (allocation%/100) - PTO - publicHolidays'
export const ADJUSTED_DAYS_FORMULA = 'baseDays * multiplier'

// Validation helpers
export const isValidAllocation = (allocation: number): boolean => {
  return allocation >= 0 && allocation <= 100
}

// Plan item helpers
export const calculateAdjustedDays = (
  baseDays: number,
  certainty: 'Low' | 'Mid' | 'High',
  multipliers: Settings['certaintyMultipliers'],
): number => {
  return baseDays * multipliers[certainty]
}

export const calculateCapacity = (
  workingDays: number,
  allocation: number,
  pto: number,
  publicHolidays: number,
): number => {
  return workingDays * (allocation / 100) - pto - publicHolidays
}

// Quarter helpers
export const getCurrentQuarter = (quarters: QuarterWithId[], currentQuarterId: string | null): QuarterWithId | undefined => {
  if (!currentQuarterId) return undefined
  return quarters.find(q => q.id === currentQuarterId)
}

// Quarter scoping helpers
export const getItemsForQuarter = (items: PlanItem[], quarterId: string): PlanItem[] => {
  return items.filter(item => item.quarterId === quarterId)
}

export const getTeamForQuarter = (team: TeamMember[], quarterId: string): TeamMember[] => {
  return team.filter(member => member.quarterId === quarterId)
}

export const getHolidaysForQuarter = (holidays: Holiday[], quarterId: string): Holiday[] => {
  return holidays.filter(holiday => holiday.quarterId === quarterId)
}

// Assignment proposal types
export type AppCode = string // keep as plain string; match case-insensitively

export interface ProposalAllocation {
  memberId: string
  name: string
  daysAssigned: number
}

export interface ProposalItem {
  itemId: string
  itemKey?: string
  itemTitle: string
  application?: AppCode
  adjustedDays: number
  allocations: ProposalAllocation[]
  unassignedDays?: number // days we could not assign
  status: 'fully-assigned' | 'partially-assigned' | 'unassigned'
  // Enhanced assignment fields
  assignmentReason?: string // Why this assignment was made
  skillMatch?: number // Percentage of required skills matched
  workloadBalance?: number // How well this balances team workload
  dependencyStatus?: 'blocked' | 'ready' | 'in-progress' // Dependency status
  estimatedStartDate?: string // When work can start
  estimatedEndDate?: string // When work is expected to complete
  confidence?: 'Low' | 'Medium' | 'High' // Assignment confidence
  alternatives?: ProposalAllocation[] // Alternative assignment options
}

// Legacy interface for backward compatibility
export interface Allocation {
  memberId: string
  name: string
  daysAssigned: number
}

export interface Proposal {
  itemId: string
  itemTitle: string
  application: string
  adjustedDays: number
  allocations: Allocation[]
  isFullyAssigned: boolean
  remainingDays: number
}

// Assignment overview types
export interface MemberAssignment {
  memberId: string
  name: string
  application?: string
  capacityDays: number
  allocatedDays: number
  remainingDays: number
  assignments: Array<{
    itemId: string
    itemKey?: string
    itemTitle: string
    application?: string
    daysAssigned: number
    adjustedDays: number
  }>
}

export interface AssignmentOverview {
  generatedAtISO: string
  perMember: MemberAssignment[]
  totals: {
    capacityDays: number
    allocatedDays: number
    remainingDays: number
  }
}

// Enhanced assignment engine types
export interface AssignmentHistory {
  id: string
  itemId: string
  memberId: string
  action: 'assigned' | 'unassigned' | 'modified' | 'auto-assigned' | 'manual-override'
  previousDays?: number
  newDays: number
  reason?: string
  timestamp: string
  userId?: string // Who made the change
}

export interface ManualOverride {
  id: string
  itemId: string
  memberId: string
  daysAssigned: number
  reason: string
  createdAt: string
  createdBy?: string
  isActive: boolean
}

export interface AssignmentStrategy {
  name: string
  description: string
  algorithm: 'skill-based' | 'workload-balanced' | 'priority-based' | 'deadline-driven' | 'hybrid'
  weights: {
    skillMatch: number
    workloadBalance: number
    priority: number
    deadline: number
    preferences: number
  }
  settings: {
    allowPartialAssignments: boolean
    maxConcurrentItems: number
    considerDependencies: boolean
    respectDeadlines: boolean
  }
}

export interface AssignmentMetrics {
  totalItems: number
  fullyAssigned: number
  partiallyAssigned: number
  unassigned: number
  averageSkillMatch: number
  workloadVariance: number
  dependencyBlocked: number
  deadlineAtRisk: number
  efficiency: number
}
