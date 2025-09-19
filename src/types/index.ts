import React from 'react'

// Core data types
export type ISO2 = string // length 2, uppercase

export interface Country {
  code: ISO2 // e.g., 'NL'
  name: string // e.g., 'Netherlands'
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
}

export interface TeamMember {
  id: string
  quarterId: string // Quarter this member belongs to
  name: string
  country?: ISO2 // replaces location
  application?: string
  allocationPct?: number
  ptoDays?: number
}

export interface Holiday {
  id: string
  quarterId: string // Quarter this holiday belongs to
  dateISO: string
  name: string
  countries: ISO2[] // can link multiple countries; empty = global
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
