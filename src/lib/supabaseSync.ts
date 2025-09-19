// Supabase sync service - syncs localStorage data to Supabase
import { supabaseService } from './supabaseService'
import type { AppState, PlanItem, TeamMember, Holiday, QuarterWithId } from '../types'

export class SupabaseSync {
  private isInitialized = false

  async initialize() {
    if (this.isInitialized) return
    try {
      await supabaseService.initializeUser('temp@example.com')
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize Supabase sync:', error)
    }
  }

  async syncQuarter(quarter: QuarterWithId) {
    try {
      await this.initialize()
      await supabaseService.createQuarter({
        id: quarter.id,
        name: quarter.name,
        description: quarter.description,
        start_iso: quarter.startISO,
        end_iso: quarter.endISO,
        is_current: false,
      })
      console.log('Synced quarter to Supabase:', quarter.name)
    } catch (error) {
      console.error('Failed to sync quarter to Supabase:', error)
    }
  }

  async syncPlanItem(item: PlanItem) {
    try {
      await this.initialize()
      await supabaseService.createPlanItem({
        id: item.id,
        quarter_id: item.quarterId,
        type: item.type,
        key: item.key || '',
        title: item.title,
        label: item.label || '',
        application: item.application || '',
        base_days: item.baseDays,
        certainty: item.certainty,
        adjusted_days: item.adjustedDays,
        notes: item.notes || '',
        jira_id: item.jiraId || null,
        jira_key: item.jiraKey || null,
        jira_status: item.jiraStatus || null,
        jira_priority: item.jiraPriority || null,
        jira_assignee: item.jiraAssignee || null,
        jira_sprint: item.jiraSprint || null,
        jira_created: item.jiraCreated || null,
        jira_updated: item.jiraUpdated || null,
      })
      console.log('Synced plan item to Supabase:', item.title)
    } catch (error) {
      console.error('Failed to sync plan item to Supabase:', error)
    }
  }

  async syncTeamMember(member: TeamMember) {
    try {
      await this.initialize()
      await supabaseService.createTeamMember({
        id: member.id,
        quarter_id: member.quarterId,
        name: member.name,
        application: member.application || '',
        allocation_pct: member.allocationPct || 100,
        pto_days: member.ptoDays || 0,
        country: member.country || null,
      })
      console.log('Synced team member to Supabase:', member.name)
    } catch (error) {
      console.error('Failed to sync team member to Supabase:', error)
    }
  }

  async syncHoliday(holiday: Holiday) {
    try {
      await this.initialize()
      await supabaseService.createHoliday({
        id: holiday.id,
        quarter_id: holiday.quarterId,
        date_iso: holiday.dateISO,
        name: holiday.name,
        countries: holiday.countries || [],
      })
      console.log('Synced holiday to Supabase:', holiday.name)
    } catch (error) {
      console.error('Failed to sync holiday to Supabase:', error)
    }
  }

  async syncAllData(appState: AppState) {
    try {
      await this.initialize()
      
      // Sync quarters
      for (const quarter of appState.quarters) {
        await this.syncQuarter(quarter)
      }
      
      // Sync plan items
      for (const item of appState.items) {
        await this.syncPlanItem(item)
      }
      
      // Sync team members
      for (const member of appState.team) {
        await this.syncTeamMember(member)
      }
      
      // Sync holidays
      for (const holiday of appState.holidays) {
        await this.syncHoliday(holiday)
      }
      
      console.log('Synced all data to Supabase')
    } catch (error) {
      console.error('Failed to sync all data to Supabase:', error)
    }
  }
}

export const supabaseSync = new SupabaseSync()
