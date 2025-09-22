import { supabase } from './supabase'
import { supabaseService } from './supabaseService'
import type { AppState, PlanItem, TeamMember, Holiday, QuarterWithId, Settings } from '../types'

/**
 * Supabase-First Data Service
 * Handles all data operations with Supabase as primary storage and localStorage as cache
 */
export class SupabaseDataService {
  private isInitialized = false
  private currentUserId: string | null = null

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true
    
    try {
      // Initialize user if not already done
      if (!this.currentUserId) {
        // Try to get stored email first
        const storedEmail = localStorage.getItem('quarterback-user-email')
        const userEmail = storedEmail || 'temp@example.com'
        
        const userId = await supabaseService.initializeUser(userEmail)
        this.currentUserId = userId
        console.log('User initialized:', userEmail, 'ID:', userId)
      }
      
      this.isInitialized = true
      console.log('Supabase Data Service initialized with user ID:', this.currentUserId)
      
      if (!this.currentUserId) {
        throw new Error('User ID not set after initialization')
      }
      
      return true
    } catch (error) {
      console.error('Failed to initialize Supabase Data Service:', error)
      return false
    }
  }

  /**
   * Load all data from Supabase
   */
  async loadAllData(): Promise<AppState | null> {
    try {
      const initialized = await this.initialize()
      if (!initialized) return null

      console.log('Supabase client available:', !!supabase)
      console.log('About to query countries table...')

      const [quartersResult, itemsResult, teamResult, holidaysResult, countriesResult, settingsResult] = await Promise.all([
        supabase.from('quarters').select('*').order('start_iso'),
        supabase.from('plan_items').select('*').order('created_at'),
        supabase.from('team_members').select('*').order('name'),
        supabase.from('holidays').select('*').order('date_iso'),
        supabase.from('countries').select('*').order('name'),
        supabase.from('settings').select('*').single()
      ])

      // Check for errors
      if (quartersResult.error) {
        console.error('Quarters query error:', quartersResult.error)
        throw quartersResult.error
      }
      if (itemsResult.error) {
        console.error('Items query error:', itemsResult.error)
        throw itemsResult.error
      }
      if (teamResult.error) {
        console.error('Team query error:', teamResult.error)
        throw teamResult.error
      }
      if (holidaysResult.error) {
        console.error('Holidays query error:', holidaysResult.error)
        throw holidaysResult.error
      }
      if (countriesResult.error) {
        console.error('Countries query error:', countriesResult.error)
        throw countriesResult.error
      }
      if (settingsResult.error && settingsResult.error.code !== 'PGRST116') {
        console.error('Settings query error:', settingsResult.error)
        throw settingsResult.error
      }

      // Transform data to match our types
      const quarters: QuarterWithId[] = (quartersResult.data || []).map(q => ({
        id: q.id,
        name: q.name,
        description: q.description,
        startISO: q.start_iso,
        endISO: q.end_iso,
        label: q.label || undefined
      }))

      const items: PlanItem[] = (itemsResult.data || []).map(item => ({
        id: item.id,
        quarterId: item.quarter_id,
        type: item.type,
        key: item.key || undefined,
        title: item.title,
        label: item.label || undefined,
        application: item.application || undefined,
        baseDays: item.base_days,
        certainty: item.certainty,
        adjustedDays: item.adjusted_days,
        notes: item.notes || undefined,
        jiraId: item.jira_id || undefined,
        jiraKey: item.jira_key || undefined,
        jiraStatus: item.jira_status || undefined,
        jiraPriority: item.jira_priority || undefined,
        jiraAssignee: item.jira_assignee || undefined,
        jiraSprint: item.jira_sprint || undefined,
        jiraCreated: item.jira_created || undefined,
        jiraUpdated: item.jira_updated || undefined
      }))

      const team: TeamMember[] = (teamResult.data || []).map(member => ({
        id: member.id,
        quarterId: member.quarter_id,
        name: member.name,
        application: member.application || undefined,
        allocationPct: member.allocation_pct,
        ptoDays: member.pto_days,
        country: member.country as any
      }))

      const holidays: Holiday[] = (holidaysResult.data || []).map(holiday => ({
        id: holiday.id,
        quarterId: holiday.quarter_id,
        dateISO: holiday.date_iso,
        name: holiday.name,
        countryCodes: holiday.country_codes || []
      }))

      console.log('Raw countries result:', countriesResult)
      console.log('Countries data:', countriesResult.data)
      console.log('Countries data length:', countriesResult.data?.length || 0)
      console.log('Countries error:', countriesResult.error)
      console.log('Countries status:', countriesResult.status)
      
      const countries: Country[] = (countriesResult.data || []).map(country => ({
        code: country.code,
        name: country.name,
        region: country.region || undefined,
        timezone: country.timezone || undefined,
        currency: country.currency || undefined,
        isActive: country.is_active ?? true
      }))
      
      console.log('Countries loaded from database:', countries.length)
      console.log('Sample countries from database:', countries.slice(0, 3))

      // Default settings if none exist
      const settings: Settings = settingsResult.data ? {
        certaintyMultipliers: settingsResult.data.certainty_multipliers || {
          Low: 1.5,
          Mid: 1.2,
          High: 1.0
        },
        strictAppMatching: settingsResult.data.strict_app_matching ?? true
      } : {
        certaintyMultipliers: { Low: 1.5, Mid: 1.2, High: 1.0 },
        strictAppMatching: true
      }

      const appState: AppState = {
        quarters,
        currentQuarterId: quarters.length > 0 ? quarters[0].id : null,
        items,
        team,
        holidays,
        countries,
        settings,
        selection: 'plan',
        proposals: []
      }

      console.log('Final app state countries:', appState.countries.length)
      console.log('Sample final countries:', appState.countries.slice(0, 3))

      // Cache in localStorage
      this.cacheToLocalStorage(appState)
      
      return appState
    } catch (error) {
      console.error('Failed to load data from Supabase:', error)
      return null
    }
  }

  /**
   * Save all data to Supabase
   */
  async saveAllData(appState: AppState): Promise<boolean> {
    try {
      const initialized = await this.initialize()
      if (!initialized) return false

      // Save quarters
      for (const quarter of appState.quarters) {
        await this.upsertQuarter(quarter)
      }

      // Save plan items
      for (const item of appState.items) {
        await this.upsertPlanItem(item)
      }

      // Save team members
      for (const member of appState.team) {
        await this.upsertTeamMember(member)
      }

      // Save holidays
      for (const holiday of appState.holidays) {
        await this.upsertHoliday(holiday)
      }

      // Save countries
      for (const country of appState.countries) {
        await this.upsertCountry(country)
      }

      // Save settings
      await this.upsertSettings(appState.settings)

      // Cache in localStorage
      this.cacheToLocalStorage(appState)

      return true
    } catch (error) {
      console.error('Failed to save data to Supabase:', error)
      return false
    }
  }

  /**
   * Quarter operations
   */
  async createQuarter(quarter: Omit<QuarterWithId, 'id'>): Promise<QuarterWithId | null> {
    try {
      const initialized = await this.initialize()
      if (!initialized) return null

      const newQuarter: QuarterWithId = {
        ...quarter,
        id: crypto.randomUUID()
      }

      await supabaseService.createQuarter({
        id: newQuarter.id,
        name: newQuarter.name,
        description: newQuarter.description,
        start_iso: newQuarter.startISO,
        end_iso: newQuarter.endISO,
        is_current: false
      })

      return newQuarter
    } catch (error) {
      console.error('Failed to create quarter:', error)
      return null
    }
  }

  async updateQuarter(id: string, updates: Partial<QuarterWithId>): Promise<boolean> {
    try {
      const initialized = await this.initialize()
      if (!initialized) return false

      const updateData: any = {}
      if (updates.name) updateData.name = updates.name
      if (updates.description) updateData.description = updates.description
      if (updates.startISO) updateData.start_iso = updates.startISO
      if (updates.endISO) updateData.end_iso = updates.endISO
      if (updates.label !== undefined) updateData.label = updates.label

      const { error } = await supabase
        .from('quarters')
        .update(updateData)
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Failed to update quarter:', error)
      return false
    }
  }

  async deleteQuarter(id: string): Promise<boolean> {
    try {
      const initialized = await this.initialize()
      if (!initialized) return false

      const { error } = await supabase
        .from('quarters')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Failed to delete quarter:', error)
      return false
    }
  }

  /**
   * Plan item operations
   */
  async createPlanItem(item: Omit<PlanItem, 'id'>): Promise<PlanItem | null> {
    try {
      const initialized = await this.initialize()
      if (!initialized) return null

      const newItem: PlanItem = {
        ...item,
        id: crypto.randomUUID()
      }

      await supabaseService.createPlanItem({
        id: newItem.id,
        quarter_id: newItem.quarterId,
        type: newItem.type,
        key: newItem.key || '',
        title: newItem.title,
        label: newItem.label || '',
        application: newItem.application || '',
        base_days: newItem.baseDays,
        certainty: newItem.certainty,
        adjusted_days: newItem.adjustedDays,
        notes: newItem.notes || '',
        jira_id: newItem.jiraId || null,
        jira_key: newItem.jiraKey || null,
        jira_status: newItem.jiraStatus || null,
        jira_priority: newItem.jiraPriority || null,
        jira_assignee: newItem.jiraAssignee || null,
        jira_sprint: newItem.jiraSprint || null,
        jira_created: newItem.jiraCreated || null,
        jira_updated: newItem.jiraUpdated || null
      })

      return newItem
    } catch (error) {
      console.error('Failed to create plan item:', error)
      return null
    }
  }

  async updatePlanItem(id: string, updates: Partial<PlanItem>): Promise<boolean> {
    try {
      const initialized = await this.initialize()
      if (!initialized) return false

      const updateData: any = {}
      if (updates.type) updateData.type = updates.type
      if (updates.key !== undefined) updateData.key = updates.key
      if (updates.title) updateData.title = updates.title
      if (updates.label !== undefined) updateData.label = updates.label
      if (updates.application !== undefined) updateData.application = updates.application
      if (updates.baseDays !== undefined) updateData.base_days = updates.baseDays
      if (updates.certainty) updateData.certainty = updates.certainty
      if (updates.adjustedDays !== undefined) updateData.adjusted_days = updates.adjustedDays
      if (updates.notes !== undefined) updateData.notes = updates.notes

      const { error } = await supabase
        .from('plan_items')
        .update(updateData)
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Failed to update plan item:', error)
      return false
    }
  }

  async deletePlanItem(id: string): Promise<boolean> {
    try {
      const initialized = await this.initialize()
      if (!initialized) return false

      const { error } = await supabase
        .from('plan_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Failed to delete plan item:', error)
      return false
    }
  }

  /**
   * Team member operations
   */
  async createTeamMember(member: Omit<TeamMember, 'id'>): Promise<TeamMember | null> {
    try {
      const initialized = await this.initialize()
      if (!initialized) return null

      const newMember: TeamMember = {
        ...member,
        id: crypto.randomUUID()
      }

      await supabaseService.createTeamMember({
        id: newMember.id,
        quarter_id: newMember.quarterId,
        name: newMember.name,
        application: newMember.application || '',
        allocation_pct: newMember.allocationPct || 100,
        pto_days: newMember.ptoDays || 0,
        country: newMember.country || null
      })

      return newMember
    } catch (error) {
      console.error('Failed to create team member:', error)
      return null
    }
  }

  async updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<boolean> {
    try {
      const initialized = await this.initialize()
      if (!initialized) return false

      const updateData: any = {}
      if (updates.name) updateData.name = updates.name
      if (updates.application !== undefined) updateData.application = updates.application
      if (updates.allocationPct !== undefined) updateData.allocation_pct = updates.allocationPct
      if (updates.ptoDays !== undefined) updateData.pto_days = updates.ptoDays
      if (updates.country !== undefined) updateData.country = updates.country

      const { error } = await supabase
        .from('team_members')
        .update(updateData)
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Failed to update team member:', error)
      return false
    }
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    try {
      const initialized = await this.initialize()
      if (!initialized) return false

      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Failed to delete team member:', error)
      return false
    }
  }

  /**
   * Holiday operations
   */
  async createHoliday(holiday: Omit<Holiday, 'id'>): Promise<Holiday | null> {
    try {
      const initialized = await this.initialize()
      if (!initialized) return null

      const newHoliday: Holiday = {
        ...holiday,
        id: crypto.randomUUID()
      }

      await supabaseService.createHoliday({
        id: newHoliday.id,
        quarter_id: newHoliday.quarterId,
        date_iso: newHoliday.dateISO,
        name: newHoliday.name,
        countries: newHoliday.countries || []
      })

      return newHoliday
    } catch (error) {
      console.error('Failed to create holiday:', error)
      return null
    }
  }

  async updateHoliday(id: string, updates: Partial<Holiday>): Promise<boolean> {
    try {
      const initialized = await this.initialize()
      if (!initialized) return false

      const updateData: any = {}
      if (updates.dateISO) updateData.date_iso = updates.dateISO
      if (updates.name) updateData.name = updates.name
      if (updates.countries) updateData.countries = updates.countries

      const { error } = await supabase
        .from('holidays')
        .update(updateData)
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Failed to update holiday:', error)
      return false
    }
  }

  async deleteHoliday(id: string): Promise<boolean> {
    try {
      const initialized = await this.initialize()
      if (!initialized) return false

      const { error } = await supabase
        .from('holidays')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Failed to delete holiday:', error)
      return false
    }
  }

  /**
   * Settings operations
   */
  async updateSettings(settings: Settings): Promise<boolean> {
    try {
      const initialized = await this.initialize()
      if (!initialized) return false

      const { error } = await supabase
        .from('settings')
        .upsert({
          id: 'default',
          certainty_multipliers: settings.certaintyMultipliers,
          countries: settings.countries,
          strict_app_matching: settings.strictAppMatching
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Failed to update settings:', error)
      return false
    }
  }

  /**
   * Helper methods
   */
  private async upsertQuarter(quarter: QuarterWithId): Promise<void> {
    if (!this.currentUserId) {
      // Try to reinitialize if user ID is missing
      const initialized = await this.initialize()
      if (!initialized || !this.currentUserId) {
        throw new Error('User not initialized and reinitialization failed')
      }
    }

    const { error } = await supabase
      .from('quarters')
      .upsert({
        id: quarter.id,
        user_id: this.currentUserId,
        name: quarter.name,
        description: quarter.description,
        start_iso: quarter.startISO,
        end_iso: quarter.endISO,
        is_current: false
      })
      .select()

    if (error) {
      console.error('Failed to upsert quarter:', error)
      throw error
    }
  }

  private async upsertPlanItem(item: PlanItem): Promise<void> {
    if (!this.currentUserId) {
      // Try to reinitialize if user ID is missing
      const initialized = await this.initialize()
      if (!initialized || !this.currentUserId) {
        throw new Error('User not initialized and reinitialization failed')
      }
    }

    const { error } = await supabase
      .from('plan_items')
      .upsert({
        id: item.id,
        user_id: this.currentUserId,
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
        required_skills: item.requiredSkills || [],
        priority: item.priority || 'Medium',
        dependencies: item.dependencies || [],
        blockers: item.blockers || [],
        estimated_complexity: item.estimatedComplexity || 'Medium',
        preferred_assignees: item.preferredAssignees || [],
        avoid_assignees: item.avoidAssignees || [],
        max_concurrent_assignments: item.maxConcurrentAssignments || 1,
        deadline: item.deadline || null,
        tags: item.tags || []
      })
      .select()

    if (error) {
      console.error('Failed to upsert plan item:', error)
      throw error
    }
  }

  private async upsertTeamMember(member: TeamMember): Promise<void> {
    if (!this.currentUserId) {
      // Try to reinitialize if user ID is missing
      const initialized = await this.initialize()
      if (!initialized || !this.currentUserId) {
        throw new Error('User not initialized and reinitialization failed')
      }
    }

    const { error } = await supabase
      .from('team_members')
      .upsert({
        id: member.id,
        user_id: this.currentUserId,
        quarter_id: member.quarterId,
        name: member.name,
        application: member.application || '',
        allocation_pct: member.allocationPct || 100,
        pto_days: member.ptoDays || 0,
        country: member.country || null,
        skills: member.skills || [],
        skill_levels: member.skillLevels || {},
        preferences: member.preferences || {},
        availability: member.availability || {}
      })
      .select()

    if (error) {
      console.error('Failed to upsert team member:', error)
      throw error
    }
  }

  private async upsertHoliday(holiday: Holiday): Promise<void> {
    if (!this.currentUserId) {
      // Try to reinitialize if user ID is missing
      const initialized = await this.initialize()
      if (!initialized || !this.currentUserId) {
        throw new Error('User not initialized and reinitialization failed')
      }
    }

    const { error } = await supabase
      .from('holidays')
      .upsert({
        id: holiday.id,
        user_id: this.currentUserId,
        quarter_id: holiday.quarterId,
        date_iso: holiday.dateISO,
        name: holiday.name,
        countries: holiday.countries || []
      })
      .select()

    if (error) {
      console.error('Failed to upsert holiday:', error)
      throw error
    }
  }

  private async upsertSettings(settings: Settings): Promise<void> {
    if (!this.currentUserId) {
      // Try to reinitialize if user ID is missing
      const initialized = await this.initialize()
      if (!initialized || !this.currentUserId) {
        throw new Error('User not initialized and reinitialization failed')
      }
    }

    const { error } = await supabase
      .from('settings')
      .upsert({
        id: 'default',
        user_id: this.currentUserId,
        certainty_multipliers: settings.certaintyMultipliers,
        strict_app_matching: settings.strictAppMatching,
        jira: settings.jira
      })
      .select()

    if (error) {
      console.error('Failed to upsert settings:', error)
      throw error
    }
  }

  private async upsertCountry(country: Country): Promise<void> {
    if (!this.currentUserId) {
      // Try to reinitialize if user ID is missing
      const initialized = await this.initialize()
      if (!initialized || !this.currentUserId) {
        throw new Error('User not initialized and reinitialization failed')
      }
    }

    const { error } = await supabase
      .from('countries')
      .upsert({
        code: country.code,
        name: country.name,
        region: country.region || null,
        timezone: country.timezone || null,
        currency: country.currency || null,
        is_active: country.isActive ?? true
      })
      .select()

    if (error) {
      console.error('Failed to upsert country:', error)
      throw error
    }
  }

  // Public country operations
  async createCountry(country: Omit<Country, 'code'>): Promise<Country | null> {
    try {
      const initialized = await this.initialize()
      if (!initialized) return null

      const newCountry: Country = {
        ...country,
        code: country.code || crypto.randomUUID().substring(0, 2).toUpperCase()
      }

      await supabaseService.createCountry(newCountry)
      return newCountry
    } catch (error) {
      console.error('Failed to create country:', error)
      return null
    }
  }

  async updateCountry(code: string, updates: Partial<Country>): Promise<boolean> {
    try {
      const initialized = await this.initialize()
      if (!initialized) return false

      await supabaseService.updateCountry(code, updates)
      return true
    } catch (error) {
      console.error('Failed to update country:', error)
      return false
    }
  }

  async deleteCountry(code: string): Promise<boolean> {
    try {
      const initialized = await this.initialize()
      if (!initialized) return false

      await supabaseService.deleteCountry(code)
      return true
    } catch (error) {
      console.error('Failed to delete country:', error)
      return false
    }
  }

  /**
   * Cache data to localStorage for offline access
   */
  private cacheToLocalStorage(appState: AppState): void {
    try {
      localStorage.setItem('quarterback-app-state', JSON.stringify(appState))
      localStorage.setItem('quarterback-last-sync', new Date().toISOString())
    } catch (error) {
      console.error('Failed to cache data to localStorage:', error)
    }
  }

  /**
   * Load data from localStorage cache
   */
  loadFromCache(): AppState | null {
    try {
      const cached = localStorage.getItem('quarterback-app-state')
      if (!cached) return null
      
      const appState = JSON.parse(cached)
      console.log('Loaded data from localStorage cache')
      return appState
    } catch (error) {
      console.error('Failed to load data from cache:', error)
      return null
    }
  }

  /**
   * Check if cache is recent (less than 1 hour old)
   */
  isCacheRecent(): boolean {
    try {
      const lastSync = localStorage.getItem('quarterback-last-sync')
      if (!lastSync) return false
      
      const lastSyncDate = new Date(lastSync)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      
      return lastSyncDate > oneHourAgo
    } catch (error) {
      console.error('Failed to check cache age:', error)
      return false
    }
  }
}

export const supabaseDataService = new SupabaseDataService()
