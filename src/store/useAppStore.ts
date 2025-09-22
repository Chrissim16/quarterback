import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { save, load } from '../lib/persist'
import { supabaseDataService } from '../lib/supabaseDataService'
import { DEFAULT_COUNTRIES } from '../lib/countries'
import { migrateToQuarterCentric, needsMigration, createBackup } from '../lib/migration'
import {
  calculateAdjustedDays,
  getCurrentQuarter,
  type AppState,
  type PlanItem,
  type TeamMember,
  type Holiday,
  type QuarterWithId,
  type Settings,
  type Selection,
  type Country,
  type ISO2,
  type ProposalItem,
} from '../types'

// Initial state
const initialQuarter: QuarterWithId = {
  id: 'q4-2025',
  name: 'Q4 2025',
  description: 'Fourth Quarter 2025',
  startISO: '2025-10-01',
  endISO: '2025-12-31',
}

const initialState: AppState = {
  quarters: [initialQuarter],
  currentQuarterId: null, // No quarter selected initially - show quarter selector
  team: [],
  holidays: [],
  items: [],
  countries: DEFAULT_COUNTRIES,
  settings: {
    certaintyMultipliers: {
      Low: 1.5,
      Mid: 1.2,
      High: 1.0,
    },
    strictAppMatching: true,
  },
  selection: 'plan',
}

// Store actions interface
interface AppActions {
  // Selection actions
  setSelection: (selection: Selection) => void

    // Quarter actions
    addQuarter: (quarter: Omit<QuarterWithId, 'id'>) => Promise<boolean>
    updateQuarter: (id: string, updates: Partial<QuarterWithId>) => Promise<boolean>
    removeQuarter: (id: string) => Promise<boolean>
    setCurrentQuarter: (id: string) => void
    getCurrentQuarter: () => QuarterWithId | undefined

  // Team actions
  addTeamMember: (member: Omit<TeamMember, 'id'>) => Promise<boolean>
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => Promise<boolean>
  removeTeamMember: (id: string) => Promise<boolean>

  // Holiday actions
  addHoliday: (holiday: Omit<Holiday, 'id'>) => Promise<boolean>
  updateHoliday: (id: string, updates: Partial<Holiday>) => Promise<boolean>
  removeHoliday: (id: string) => Promise<boolean>

  // Plan item actions
  addPlanItem: (item: Omit<PlanItem, 'id'>) => Promise<boolean>
  updatePlanItem: (id: string, updates: Partial<PlanItem>) => Promise<boolean>
  removePlanItem: (id: string) => Promise<boolean>
  recalculateAdjustedDays: (id: string) => void

  // Settings actions
  updateSettings: (settings: Partial<Settings>) => Promise<boolean>

  // Country actions
  addCountry: (country: Omit<Country, 'id'>) => void
  updateCountry: (code: ISO2, updates: Partial<Country>) => void
  removeCountry: (code: ISO2) => void
  debugCountries: () => Country[]

  // Proposal actions
  setProposal: (proposal: { generatedAtISO: string; items: ProposalItem[] }) => void
  clearProposal: () => void

  // Utility actions
  resetStore: () => void
  loadDataFromSupabase: () => Promise<boolean>
  syncToSupabase: () => Promise<{ success: boolean; message: string }>
  
  // Quarter-scoped data getters
  getCurrentQuarterItems: () => PlanItem[]
  getCurrentQuarterTeam: () => TeamMember[]
  getCurrentQuarterHolidays: () => Holiday[]
}

// Store implementation
export const useAppStore = create<AppState & AppActions>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    ...initialState,

    // Selection actions
    setSelection: (selection: Selection) => {
      set({ selection })
    },

    // Quarter actions
    addQuarter: async (quarter: Omit<QuarterWithId, 'id'>) => {
      try {
        const newQuarter = await supabaseDataService.createQuarter(quarter)
        if (!newQuarter) return false

        set(state => ({
          quarters: [...state.quarters, newQuarter],
        }))
        
        // Don't trigger automatic sync since we already saved to Supabase
        console.log('Quarter added and saved to Supabase:', newQuarter.id)
        return true
      } catch (error) {
        console.error('Failed to add quarter:', error)
        return false
      }
    },

    updateQuarter: async (id: string, updates: Partial<QuarterWithId>) => {
      try {
        const success = await supabaseDataService.updateQuarter(id, updates)
        if (!success) return false

        set(state => ({
          quarters: state.quarters.map(quarter =>
            quarter.id === id ? { ...quarter, ...updates } : quarter
          ),
        }))
        
        return true
      } catch (error) {
        console.error('Failed to update quarter:', error)
        return false
      }
    },

    removeQuarter: async (id: string) => {
      try {
        const success = await supabaseDataService.deleteQuarter(id)
        if (!success) return false

        set(state => {
          const newQuarters = state.quarters.filter(quarter => quarter.id !== id)
          const newCurrentQuarterId = state.currentQuarterId === id 
            ? (newQuarters.length > 0 ? newQuarters[0].id : '')
            : state.currentQuarterId
          
          return {
            quarters: newQuarters,
            currentQuarterId: newCurrentQuarterId,
          }
        })
        
        return true
      } catch (error) {
        console.error('Failed to remove quarter:', error)
        return false
      }
    },

    setCurrentQuarter: (id: string) => {
      set({ currentQuarterId: id })
    },

    getCurrentQuarter: () => {
      const state = get()
      return getCurrentQuarter(state.quarters, state.currentQuarterId)
    },

    // Team actions
    addTeamMember: async (member: Omit<TeamMember, 'id'>) => {
      try {
        const state = get()
        console.log('addTeamMember called with member:', member.name)
        console.log('Current quarter ID in store:', state.currentQuarterId)
        
        if (!state.currentQuarterId) {
          throw new Error('No quarter selected. Please select a quarter first.')
        }
        
        const memberWithQuarter = {
          ...member,
          quarterId: state.currentQuarterId,
          country: member.country?.toUpperCase() as ISO2,
        }
        
        console.log('Member with quarter ID:', memberWithQuarter.quarterId)
        
        const newMember = await supabaseDataService.createTeamMember(memberWithQuarter)
        if (!newMember) {
          console.log('Failed to create team member in Supabase')
          return false
        }
        
        console.log('Team member created in Supabase:', newMember.id)

        set(state => ({
          team: [...state.team, newMember],
        }))
        
        console.log('Team member added to store')
        return true
      } catch (error) {
        console.error('Failed to add team member:', error)
        return false
      }
    },

    updateTeamMember: async (id: string, updates: Partial<TeamMember>) => {
      try {
        const success = await supabaseDataService.updateTeamMember(id, updates)
        if (!success) return false

        set(state => ({
          team: state.team.map(member =>
            member.id === id
              ? {
                  ...member,
                  ...updates,
                  country: updates.country?.toUpperCase() as ISO2,
                }
              : member,
          ),
        }))
        
        return true
      } catch (error) {
        console.error('Failed to update team member:', error)
        return false
      }
    },

    removeTeamMember: async (id: string) => {
      try {
        const success = await supabaseDataService.deleteTeamMember(id)
        if (!success) return false

        set(state => ({
          team: state.team.filter(member => member.id !== id),
        }))
        
        return true
      } catch (error) {
        console.error('Failed to remove team member:', error)
        return false
      }
    },

    // Holiday actions
    addHoliday: async (holiday: Omit<Holiday, 'id'>) => {
      try {
        const state = get()
        if (!state.currentQuarterId) {
          throw new Error('No quarter selected. Please select a quarter first.')
        }
        
        const holidayWithQuarter = {
          ...holiday,
          quarterId: state.currentQuarterId,
          countries: holiday.countries || [],
        }
        
        const newHoliday = await supabaseDataService.createHoliday(holidayWithQuarter)
        if (!newHoliday) return false

        set(state => ({
          holidays: [...state.holidays, newHoliday],
        }))
        
        return true
      } catch (error) {
        console.error('Failed to add holiday:', error)
        return false
      }
    },

    updateHoliday: async (id: string, updates: Partial<Holiday>) => {
      try {
        const success = await supabaseDataService.updateHoliday(id, updates)
        if (!success) return false

        set(state => ({
          holidays: state.holidays.map(holiday =>
            holiday.id === id
              ? {
                  ...holiday,
                  ...updates,
                  countries: updates.countries || holiday.countries || [],
                }
              : holiday,
          ),
        }))
        
        return true
      } catch (error) {
        console.error('Failed to update holiday:', error)
        return false
      }
    },

    removeHoliday: async (id: string) => {
      try {
        const success = await supabaseDataService.deleteHoliday(id)
        if (!success) return false

        set(state => ({
          holidays: state.holidays.filter(holiday => holiday.id !== id),
        }))
        
        return true
      } catch (error) {
        console.error('Failed to remove holiday:', error)
        return false
      }
    },

    // Plan item actions
    addPlanItem: async (item: Omit<PlanItem, 'id'>) => {
      try {
        const state = get()
        if (!state.currentQuarterId) {
          throw new Error('No quarter selected. Please select a quarter first.')
        }
        
        const itemWithQuarter = {
          ...item,
          quarterId: state.currentQuarterId,
        }

        // Calculate adjusted days if baseDays and certainty are provided
        if (itemWithQuarter.baseDays && itemWithQuarter.certainty) {
          itemWithQuarter.adjustedDays = calculateAdjustedDays(
            itemWithQuarter.baseDays,
            itemWithQuarter.certainty,
            state.settings.certaintyMultipliers,
          )
        }

        const newItem = await supabaseDataService.createPlanItem(itemWithQuarter)
        if (!newItem) return false

        set(state => ({
          items: [...state.items, newItem],
        }))
        
        return true
      } catch (error) {
        console.error('Failed to add plan item:', error)
        return false
      }
    },

    updatePlanItem: async (id: string, updates: Partial<PlanItem>) => {
      try {
        const success = await supabaseDataService.updatePlanItem(id, updates)
        if (!success) return false

        set(state => {
          const updatedItems = state.items.map(item => {
            if (item.id === id) {
              const updatedItem = { ...item, ...updates }

              // Recalculate adjusted days if baseDays or certainty changed
              if (
                (updates.baseDays !== undefined ||
                  updates.certainty !== undefined) &&
                updatedItem.baseDays &&
                updatedItem.certainty
              ) {
                updatedItem.adjustedDays = calculateAdjustedDays(
                  updatedItem.baseDays,
                  updatedItem.certainty,
                  state.settings.certaintyMultipliers,
                )
              }

              return updatedItem
            }
            return item
          })

          return { items: updatedItems }
        })
        
        return true
      } catch (error) {
        console.error('Failed to update plan item:', error)
        return false
      }
    },

    removePlanItem: async (id: string) => {
      try {
        const success = await supabaseDataService.deletePlanItem(id)
        if (!success) return false

        set(state => ({
          items: state.items.filter(item => item.id !== id),
        }))
        
        return true
      } catch (error) {
        console.error('Failed to remove plan item:', error)
        return false
      }
    },

    recalculateAdjustedDays: (id: string) => {
      set(state => {
        const updatedItems = state.items.map(item => {
          if (item.id === id && item.baseDays && item.certainty) {
            return {
              ...item,
              adjustedDays: calculateAdjustedDays(
                item.baseDays,
                item.certainty,
                state.settings.certaintyMultipliers,
              ),
            }
          }
          return item
        })

        return { items: updatedItems }
      })
    },

    // Settings actions
    updateSettings: async (settings: Partial<Settings>) => {
      try {
        const newSettings = { ...get().settings, ...settings }
        const success = await supabaseDataService.updateSettings(newSettings)
        if (!success) return false

        set(state => ({
          settings: newSettings,
        }))
        
        return true
      } catch (error) {
        console.error('Failed to update settings:', error)
        return false
      }
    },

    // Country actions
    addCountry: async (country: Omit<Country, 'code'>) => {
      try {
        const newCountry = await supabaseDataService.createCountry(country)
        if (!newCountry) return false

        set(state => ({
          countries: [...state.countries, newCountry],
        }))
        
        return true
      } catch (error) {
        console.error('Failed to add country:', error)
        return false
      }
    },

    // Debug function to check countries
    debugCountries: () => {
      const state = get()
      console.log('🔍 Countries Debug:')
      console.log('- Countries in store:', state.countries.length)
      console.log('- Sample countries:', state.countries.slice(0, 3))
      console.log('- Full countries array:', state.countries)
      return state.countries
    },

    updateCountry: async (code: ISO2, updates: Partial<Country>) => {
      try {
        const success = await supabaseDataService.updateCountry(code, updates)
        if (!success) return false

        set(state => ({
          countries: state.countries.map(country =>
            country.code === code ? { ...country, ...updates } : country
          ),
        }))
        
        return true
      } catch (error) {
        console.error('Failed to update country:', error)
        return false
      }
    },

    removeCountry: async (code: ISO2) => {
      try {
        const success = await supabaseDataService.deleteCountry(code)
        if (!success) return false

        set(state => ({
          countries: state.countries.filter(country => country.code !== code),
        }))
        
        return true
      } catch (error) {
        console.error('Failed to remove country:', error)
        return false
      }
    },

    // Proposal actions
    setProposal: (proposal: { generatedAtISO: string; items: ProposalItem[] }) => {
      set({ proposal })
    },

    clearProposal: () => {
      set({ proposal: undefined })
    },

    // Utility actions
    resetStore: () => {
      set(initialState)
    },

    loadDataFromSupabase: async () => {
      try {
        const appState = await supabaseDataService.loadAllData()
        if (appState) {
          set(appState)
          return true
        }
        return false
      } catch (error) {
        console.error('Failed to load data from Supabase:', error)
        return false
      }
    },

    syncToSupabase: async () => {
      try {
        const state = get()
        const success = await supabaseDataService.saveAllData(state)
        if (success) {
          console.log('Manual sync to Supabase successful')
          return { success: true, message: 'Data synced to Supabase successfully' }
        } else {
          return { success: false, message: 'Failed to sync to Supabase' }
        }
      } catch (error) {
        console.error('Manual sync failed:', error)
        return { success: false, message: `Sync failed: ${error.message}` }
      }
    },
    
    // Quarter-scoped data getters
    getCurrentQuarterItems: () => {
      const state = get()
      if (!state.currentQuarterId) return []
      return state.items.filter(item => item.quarterId === state.currentQuarterId)
    },
    
    getCurrentQuarterTeam: () => {
      const state = get()
      if (!state.currentQuarterId) return []
      return state.team.filter(member => member.quarterId === state.currentQuarterId)
    },
    
    getCurrentQuarterHolidays: () => {
      const state = get()
      if (!state.currentQuarterId) return []
      return state.holidays.filter(holiday => holiday.quarterId === state.currentQuarterId)
    },
  })),
)

// Persistence middleware
const STORAGE_KEY = 'quarterback-app-state'

// Initialize with Supabase-first approach
const initializeApp = async () => {
  try {
    // Try to load from Supabase first
    const supabaseData = await supabaseDataService.loadAllData()
    if (supabaseData) {
      console.log('Loaded data from Supabase')
      console.log('Countries loaded from Supabase:', supabaseData.countries?.length || 0)
      console.log('Sample countries:', supabaseData.countries?.slice(0, 3))
      useAppStore.setState(supabaseData)
      return
    }

    // Fallback to localStorage if Supabase fails
    const savedState = load<AppState>(STORAGE_KEY, initialState)
    if (savedState) {
      console.log('Loaded data from localStorage cache')
      console.log('Countries in localStorage:', savedState.countries?.length || 0)
      console.log('Sample countries from localStorage:', savedState.countries?.slice(0, 3))
      
      // Check if migration is needed
      if (needsMigration(savedState)) {
        console.log('Data migration needed, running migration...')
        
        // Create backup before migration
        const backup = createBackup(savedState)
        localStorage.setItem(`${STORAGE_KEY}-backup-${Date.now()}`, backup)
        console.log('Backup created before migration')
        
        // Run migration
        const migrationResult = migrateToQuarterCentric(savedState)
        if (migrationResult.success) {
          console.log('Migration completed successfully:', migrationResult)
          useAppStore.setState(savedState)
          // Set flag to show migration notification
          localStorage.setItem('quarterback-migration-completed', 'true')
        } else {
          console.error('Migration failed:', migrationResult.errors)
          // Use initial state if migration fails
          useAppStore.setState(initialState)
        }
      } else {
        useAppStore.setState(savedState)
      }
    } else {
      console.log('No saved data found, using initial state')
      console.log('Countries in initial state:', initialState.countries?.length || 0)
      useAppStore.setState(initialState)
    }
  } catch (error) {
    console.error('Failed to initialize app:', error)
    // Fallback to localStorage cache
    const cachedData = supabaseDataService.loadFromCache()
    if (cachedData) {
      console.log('Loaded data from localStorage cache (fallback)')
      useAppStore.setState(cachedData)
    } else {
      console.log('No cached data found, using initial state')
      useAppStore.setState(initialState)
    }
  }
}

// Initialize the app
initializeApp()

// Subscribe to state changes and save to both localStorage and Supabase
// Track if we're currently saving to prevent duplicate saves
let isSavingToSupabase = false
let lastSyncTime = 0
const SYNC_DEBOUNCE_MS = 2000 // Only sync every 2 seconds

useAppStore.subscribe(
  state => state,
  async (state) => {
    // Always cache to localStorage for offline access
    save(STORAGE_KEY, state)
    
    // Only sync to Supabase if we haven't synced recently (debounced)
    const now = Date.now()
    if (!isSavingToSupabase && (now - lastSyncTime) > SYNC_DEBOUNCE_MS) {
      isSavingToSupabase = true
      lastSyncTime = now
      
      try {
        await supabaseDataService.saveAllData(state)
        console.log('Data synced to Supabase (debounced)')
      } catch (error) {
        console.error('Failed to save to Supabase:', error)
        // Don't throw - localStorage backup is still working
      } finally {
        isSavingToSupabase = false
      }
    }
  },
)
