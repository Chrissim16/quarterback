// Data migration utilities for quarter-centric architecture
import type { AppState, PlanItem, TeamMember, Holiday, QuarterWithId } from '../types'

export interface MigrationResult {
  success: boolean
  migratedItems: number
  migratedTeam: number
  migratedHolidays: number
  errors: string[]
}

/**
 * Migrates existing localStorage data to the quarter-centric architecture
 * Assigns all existing data to the first available quarter or creates a default quarter
 */
export function migrateToQuarterCentric(data: AppState): MigrationResult {
  const result: MigrationResult = {
    success: true,
    migratedItems: 0,
    migratedTeam: 0,
    migratedHolidays: 0,
    errors: []
  }

  try {
    // Ensure we have at least one quarter
    let targetQuarterId: string
    if (data.quarters && data.quarters.length > 0) {
      targetQuarterId = data.quarters[0].id
    } else {
      // Create a default quarter for migration
      const defaultQuarter: QuarterWithId = {
        id: 'migration-quarter',
        name: 'Migration Quarter',
        description: 'Default quarter for migrated data',
        startISO: '2025-01-01',
        endISO: '2025-12-31',
        label: '25Q1'
      }
      data.quarters = [defaultQuarter]
      targetQuarterId = defaultQuarter.id
    }

    // Migrate plan items
    if (data.items) {
      data.items = data.items.map((item: PlanItem) => ({
        ...item,
        quarterId: item.quarterId || targetQuarterId
      }))
      result.migratedItems = data.items.length
    }

    // Migrate team members
    if (data.team) {
      data.team = data.team.map((member: TeamMember) => ({
        ...member,
        quarterId: member.quarterId || targetQuarterId
      }))
      result.migratedTeam = data.team.length
    }

    // Migrate holidays
    if (data.holidays) {
      data.holidays = data.holidays.map((holiday: Holiday) => ({
        ...holiday,
        quarterId: holiday.quarterId || targetQuarterId
      }))
      result.migratedHolidays = data.holidays.length
    }

    // Set current quarter if not set
    if (!data.currentQuarterId && data.quarters.length > 0) {
      data.currentQuarterId = data.quarters[0].id
    }

  } catch (error) {
    result.success = false
    result.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return result
}

/**
 * Checks if data needs migration (has items without quarterId)
 */
export function needsMigration(data: AppState): boolean {
  const hasItemsWithoutQuarter = data.items?.some(item => !item.quarterId) || false
  const hasTeamWithoutQuarter = data.team?.some(member => !member.quarterId) || false
  const hasHolidaysWithoutQuarter = data.holidays?.some(holiday => !holiday.quarterId) || false
  
  return hasItemsWithoutQuarter || hasTeamWithoutQuarter || hasHolidaysWithoutQuarter
}

/**
 * Creates a backup of the current data before migration
 */
export function createBackup(data: AppState): string {
  return JSON.stringify(data, null, 2)
}

/**
 * Restores data from a backup
 */
export function restoreFromBackup(backupData: string): AppState | null {
  try {
    return JSON.parse(backupData)
  } catch (error) {
    console.error('Failed to restore from backup:', error)
    return null
  }
}
