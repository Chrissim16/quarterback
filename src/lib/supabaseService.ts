// Supabase service layer for Quarterback
import { supabase, TABLES } from './supabase'

export class SupabaseService {
  private userId: string | null = null

  // Initialize user (get or create)
  async initializeUser(email: string): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.')
    }

    try {
      // Check if user already exists
      const { data: existingUser, error: selectError } = await supabase
        .from(TABLES.USERS)
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        this.userId = existingUser.id
        return existingUser.id
      }

      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from(TABLES.USERS)
        .insert({
          id: crypto.randomUUID(),
          email: email,
        })
        .select('id')
        .single()

      if (insertError) {
        throw new Error(`Failed to create user: ${insertError.message}`)
      }

      this.userId = newUser.id
      return newUser.id
    } catch (error) {
      console.error('Error initializing user:', error)
      throw error
    }
  }

  // Get current user ID
  getCurrentUserId(): string {
    if (!this.userId) {
      throw new Error('User not initialized. Call initializeUser first.')
    }
    return this.userId
  }

  // Quarters CRUD
  async getQuarters(): Promise<any[]> {
    if (!supabase || !this.userId) return []
    
    const { data, error } = await supabase
      .from(TABLES.QUARTERS)
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching quarters:', error)
      return []
    }
    return data || []
  }

  async createQuarter(quarter: any): Promise<any> {
    if (!supabase || !this.userId) throw new Error('Supabase not initialized')
    
    const { data, error } = await supabase
      .from(TABLES.QUARTERS)
      .insert({
        ...quarter,
        user_id: this.userId,
        // Use the provided ID if it exists, otherwise generate a new one
        id: quarter.id || crypto.randomUUID(),
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create quarter: ${error.message}`)
    return data
  }

  async updateQuarter(id: string, quarter: any): Promise<any> {
    if (!supabase || !this.userId) throw new Error('Supabase not initialized')
    
    const { data, error } = await supabase
      .from(TABLES.QUARTERS)
      .update(quarter)
      .eq('id', id)
      .eq('user_id', this.userId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update quarter: ${error.message}`)
    return data
  }

  async deleteQuarter(id: string): Promise<void> {
    if (!supabase || !this.userId) throw new Error('Supabase not initialized')
    
    const { error } = await supabase
      .from(TABLES.QUARTERS)
      .delete()
      .eq('id', id)
      .eq('user_id', this.userId)

    if (error) throw new Error(`Failed to delete quarter: ${error.message}`)
  }

  // Plan Items CRUD
  async getPlanItems(): Promise<any[]> {
    if (!supabase || !this.userId) return []
    
    const { data, error } = await supabase
      .from(TABLES.PLAN_ITEMS)
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching plan items:', error)
      return []
    }
    return data || []
  }

  async createPlanItem(item: any): Promise<any> {
    if (!supabase || !this.userId) throw new Error('Supabase not initialized')
    
    const { data, error } = await supabase
      .from(TABLES.PLAN_ITEMS)
      .insert({
        ...item,
        user_id: this.userId,
        id: item.id || crypto.randomUUID(),
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create plan item: ${error.message}`)
    return data
  }

  async updatePlanItem(id: string, item: any): Promise<any> {
    if (!supabase || !this.userId) throw new Error('Supabase not initialized')
    
    const { data, error } = await supabase
      .from(TABLES.PLAN_ITEMS)
      .update(item)
      .eq('id', id)
      .eq('user_id', this.userId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update plan item: ${error.message}`)
    return data
  }

  async deletePlanItem(id: string): Promise<void> {
    if (!supabase || !this.userId) throw new Error('Supabase not initialized')
    
    const { error } = await supabase
      .from(TABLES.PLAN_ITEMS)
      .delete()
      .eq('id', id)
      .eq('user_id', this.userId)

    if (error) throw new Error(`Failed to delete plan item: ${error.message}`)
  }

  // Team Members CRUD
  async getTeamMembers(): Promise<any[]> {
    if (!supabase || !this.userId) return []
    
    const { data, error } = await supabase
      .from(TABLES.TEAM_MEMBERS)
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching team members:', error)
      return []
    }
    return data || []
  }

  async createTeamMember(member: any): Promise<any> {
    if (!supabase || !this.userId) throw new Error('Supabase not initialized')
    
    const { data, error } = await supabase
      .from(TABLES.TEAM_MEMBERS)
      .insert({
        ...member,
        user_id: this.userId,
        id: member.id || crypto.randomUUID(),
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create team member: ${error.message}`)
    return data
  }

  async updateTeamMember(id: string, member: any): Promise<any> {
    if (!supabase || !this.userId) throw new Error('Supabase not initialized')
    
    const { data, error } = await supabase
      .from(TABLES.TEAM_MEMBERS)
      .update(member)
      .eq('id', id)
      .eq('user_id', this.userId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update team member: ${error.message}`)
    return data
  }

  async deleteTeamMember(id: string): Promise<void> {
    if (!supabase || !this.userId) throw new Error('Supabase not initialized')
    
    const { error } = await supabase
      .from(TABLES.TEAM_MEMBERS)
      .delete()
      .eq('id', id)
      .eq('user_id', this.userId)

    if (error) throw new Error(`Failed to delete team member: ${error.message}`)
  }

  // Holidays CRUD
  async getHolidays(): Promise<any[]> {
    if (!supabase || !this.userId) return []
    
    const { data, error } = await supabase
      .from(TABLES.HOLIDAYS)
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching holidays:', error)
      return []
    }
    return data || []
  }

  async createHoliday(holiday: any): Promise<any> {
    if (!supabase || !this.userId) throw new Error('Supabase not initialized')
    
    const { data, error } = await supabase
      .from(TABLES.HOLIDAYS)
      .insert({
        ...holiday,
        user_id: this.userId,
        id: holiday.id || crypto.randomUUID(),
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create holiday: ${error.message}`)
    return data
  }

  async updateHoliday(id: string, holiday: any): Promise<any> {
    if (!supabase || !this.userId) throw new Error('Supabase not initialized')
    
    const { data, error } = await supabase
      .from(TABLES.HOLIDAYS)
      .update(holiday)
      .eq('id', id)
      .eq('user_id', this.userId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update holiday: ${error.message}`)
    return data
  }

  async deleteHoliday(id: string): Promise<void> {
    if (!supabase || !this.userId) throw new Error('Supabase not initialized')
    
    const { error } = await supabase
      .from(TABLES.HOLIDAYS)
      .delete()
      .eq('id', id)
      .eq('user_id', this.userId)

    if (error) throw new Error(`Failed to delete holiday: ${error.message}`)
  }

  // Settings CRUD
  async getSettings(): Promise<any> {
    if (!supabase || !this.userId) return null
    
    const { data, error } = await supabase
      .from(TABLES.SETTINGS)
      .select('*')
      .eq('user_id', this.userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching settings:', error)
      return null
    }
    return data
  }

  async saveSettings(settings: any): Promise<any> {
    if (!supabase || !this.userId) throw new Error('Supabase not initialized')
    
    const { data, error } = await supabase
      .from(TABLES.SETTINGS)
      .upsert({
        ...settings,
        user_id: this.userId,
        id: settings.id || crypto.randomUUID(),
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to save settings: ${error.message}`)
    return data
  }

  // Proposals CRUD
  async getProposals(): Promise<any[]> {
    if (!supabase || !this.userId) return []
    
    const { data, error } = await supabase
      .from(TABLES.PROPOSALS)
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching proposals:', error)
      return []
    }
    return data || []
  }

  async saveProposal(proposal: any): Promise<any> {
    if (!supabase || !this.userId) throw new Error('Supabase not initialized')
    
    const { data, error } = await supabase
      .from(TABLES.PROPOSALS)
      .insert({
        ...proposal,
        user_id: this.userId,
        id: proposal.id || crypto.randomUUID(),
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to save proposal: ${error.message}`)
    return data
  }

  // Migration helper
  async migrateLocalStorageToSupabase(appState: any): Promise<void> {
    if (!supabase || !this.userId) throw new Error('Supabase not initialized')
    
    try {
      // Migrate quarters
      if (appState.quarters) {
        for (const quarter of appState.quarters) {
          await this.createQuarter({
            name: quarter.name,
            description: quarter.description || '',
            start_iso: quarter.startISO,
            end_iso: quarter.endISO,
            is_current: quarter.id === appState.currentQuarterId,
          })
        }
      }

      // Migrate plan items
      if (appState.items) {
        for (const item of appState.items) {
          await this.createPlanItem({
            quarter_id: item.quarterId,
            type: item.type,
            key: item.key || '',
            title: item.title,
            label: item.label || '',
            application: item.application || '',
            base_days: item.baseDays || 1,
            certainty: item.certainty || 'Mid',
            adjusted_days: item.adjustedDays || 1,
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
        }
      }

      // Migrate team members
      if (appState.team) {
        for (const member of appState.team) {
          await this.createTeamMember({
            quarter_id: member.quarterId,
            name: member.name,
            application: member.application || '',
            allocation_pct: member.allocationPct || 100,
            pto_days: member.ptoDays || 0,
            country: member.country || null,
          })
        }
      }

      // Migrate holidays
      if (appState.holidays) {
        for (const holiday of appState.holidays) {
          await this.createHoliday({
            quarter_id: holiday.quarterId,
            date_iso: holiday.dateISO,
            name: holiday.name,
            countries: holiday.countries || [],
          })
        }
      }

      // Migrate settings
      if (appState.settings) {
        await this.saveSettings({
          certainty_multipliers: appState.settings.certaintyMultipliers,
          countries: appState.settings.countries,
          strict_app_matching: appState.settings.strictAppMatching,
          jira: appState.settings.jira,
        })
      }

      console.log('Migration completed successfully')
    } catch (error) {
      console.error('Migration failed:', error)
      throw error
    }
  }
}

export const supabaseService = new SupabaseService()