// Migration utility to move localStorage data to Supabase
import { supabaseSync } from './supabaseSync'
import { load } from './persist'
import type { AppState } from '../types'

export async function migrateLocalStorageToSupabase(): Promise<{ success: boolean; message: string }> {
  try {
    // Load data from localStorage
    const appState = load() as AppState
    
    if (!appState) {
      return { success: false, message: 'No data found in localStorage' }
    }

    console.log('Starting migration to Supabase...')
    console.log('Data to migrate:', {
      quarters: appState.quarters.length,
      items: appState.items.length,
      team: appState.team.length,
      holidays: appState.holidays.length,
    })

    // Migrate all data to Supabase
    await supabaseSync.syncAllData(appState)

    // Mark migration as completed
    localStorage.setItem('quarterback-supabase-migration-completed', 'true')
    localStorage.setItem('quarterback-supabase-migration-date', new Date().toISOString())

    return { 
      success: true, 
      message: `Successfully migrated ${appState.quarters.length} quarters, ${appState.items.length} plan items, ${appState.team.length} team members, and ${appState.holidays.length} holidays to Supabase!` 
    }
  } catch (error) {
    console.error('Migration failed:', error)
    return { 
      success: false, 
      message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

export function hasCompletedMigration(): boolean {
  return localStorage.getItem('quarterback-supabase-migration-completed') === 'true'
}

export function getMigrationDate(): string | null {
  return localStorage.getItem('quarterback-supabase-migration-date')
}
