import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { save, load } from '../lib/persist'
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
  settings: {
    certaintyMultipliers: {
      Low: 1.5,
      Mid: 1.2,
      High: 1.0,
    },
    countries: DEFAULT_COUNTRIES,
    strictAppMatching: true,
  },
  selection: 'plan',
}

// Store actions interface
interface AppActions {
  // Selection actions
  setSelection: (selection: Selection) => void

  // Quarter actions
  addQuarter: (quarter: Omit<QuarterWithId, 'id'>) => void
  updateQuarter: (id: string, updates: Partial<QuarterWithId>) => void
  removeQuarter: (id: string) => void
  setCurrentQuarter: (id: string) => void
  getCurrentQuarter: () => QuarterWithId | undefined

  // Team actions
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void
  removeTeamMember: (id: string) => void

  // Holiday actions
  addHoliday: (holiday: Omit<Holiday, 'id'>) => void
  updateHoliday: (id: string, updates: Partial<Holiday>) => void
  removeHoliday: (id: string) => void

  // Plan item actions
  addPlanItem: (item: Omit<PlanItem, 'id'>) => void
  updatePlanItem: (id: string, updates: Partial<PlanItem>) => void
  removePlanItem: (id: string) => void
  recalculateAdjustedDays: (id: string) => void

  // Settings actions
  updateSettings: (settings: Partial<Settings>) => void

  // Country actions
  addCountry: (country: Omit<Country, 'id'>) => void
  updateCountry: (code: ISO2, updates: Partial<Country>) => void
  removeCountry: (code: ISO2) => void

  // Proposal actions
  setProposal: (proposal: { generatedAtISO: string; items: ProposalItem[] }) => void
  clearProposal: () => void

  // Utility actions
  resetStore: () => void
  
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
    addQuarter: (quarter: Omit<QuarterWithId, 'id'>) => {
      const newQuarter: QuarterWithId = {
        ...quarter,
        id: crypto.randomUUID(),
      }
      set(state => ({
        quarters: [...state.quarters, newQuarter],
      }))
    },

    updateQuarter: (id: string, updates: Partial<QuarterWithId>) => {
      set(state => ({
        quarters: state.quarters.map(quarter =>
          quarter.id === id ? { ...quarter, ...updates } : quarter
        ),
      }))
    },

    removeQuarter: (id: string) => {
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
    },

    setCurrentQuarter: (id: string) => {
      set({ currentQuarterId: id })
    },

    getCurrentQuarter: () => {
      const state = get()
      return getCurrentQuarter(state.quarters, state.currentQuarterId)
    },

    // Team actions
    addTeamMember: (member: Omit<TeamMember, 'id'>) => {
      const state = get()
      if (!state.currentQuarterId) {
        throw new Error('No quarter selected. Please select a quarter first.')
      }
      
      const newMember: TeamMember = {
        ...member,
        id: crypto.randomUUID(),
        quarterId: state.currentQuarterId,
        country: member.country?.toUpperCase() as ISO2,
      }
      set(state => ({
        team: [...state.team, newMember],
      }))
    },

    updateTeamMember: (id: string, updates: Partial<TeamMember>) => {
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
    },

    removeTeamMember: (id: string) => {
      set(state => ({
        team: state.team.filter(member => member.id !== id),
      }))
    },

    // Holiday actions
    addHoliday: (holiday: Omit<Holiday, 'id'>) => {
      const state = get()
      if (!state.currentQuarterId) {
        throw new Error('No quarter selected. Please select a quarter first.')
      }
      
      const newHoliday: Holiday = {
        ...holiday,
        id: crypto.randomUUID(),
        quarterId: state.currentQuarterId,
        countries: holiday.countries || [], // ensure countries array exists
      }
      set(state => ({
        holidays: [...state.holidays, newHoliday],
      }))
    },

    updateHoliday: (id: string, updates: Partial<Holiday>) => {
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
    },

    removeHoliday: (id: string) => {
      set(state => ({
        holidays: state.holidays.filter(holiday => holiday.id !== id),
      }))
    },

    // Plan item actions
    addPlanItem: (item: Omit<PlanItem, 'id'>) => {
      const state = get()
      if (!state.currentQuarterId) {
        throw new Error('No quarter selected. Please select a quarter first.')
      }
      
      const newItem: PlanItem = {
        ...item,
        id: crypto.randomUUID(),
        quarterId: state.currentQuarterId,
      }

      // Calculate adjusted days if baseDays and certainty are provided
      if (newItem.baseDays && newItem.certainty) {
        newItem.adjustedDays = calculateAdjustedDays(
          newItem.baseDays,
          newItem.certainty,
          state.settings.certaintyMultipliers,
        )
      }

      set(state => ({
        items: [...state.items, newItem],
      }))
    },

    updatePlanItem: (id: string, updates: Partial<PlanItem>) => {
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
    },

    removePlanItem: (id: string) => {
      set(state => ({
        items: state.items.filter(item => item.id !== id),
      }))
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
    updateSettings: (settings: Partial<Settings>) => {
      set(state => ({
        settings: { ...state.settings, ...settings },
      }))
    },

    // Country actions
    addCountry: (country: Omit<Country, 'id'>) => {
      set(state => {
        const newCountries = [...state.settings.countries, country]
        const uniqueCountries = newCountries.filter((c, index, arr) =>
          arr.findIndex(other => other.code === c.code) === index
        )
        const sortedCountries = uniqueCountries.sort((a, b) => a.code.localeCompare(b.code))

        return {
          settings: {
            ...state.settings,
            countries: sortedCountries,
          },
        }
      })
    },

    updateCountry: (code: ISO2, updates: Partial<Country>) => {
      set(state => ({
        settings: {
          ...state.settings,
          countries: state.settings.countries.map(country =>
            country.code === code ? { ...country, ...updates } : country
          ),
        },
      }))
    },

    removeCountry: (code: ISO2) => {
      set(state => ({
        settings: {
          ...state.settings,
          countries: state.settings.countries.filter(country => country.code !== code),
        },
      }))
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

// Load initial state from localStorage and migrate if needed
const savedState = load<AppState>(STORAGE_KEY, initialState)
if (savedState) {
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
}

// Subscribe to state changes and save to localStorage
useAppStore.subscribe(
  state => state,
  state => {
    save(STORAGE_KEY, state)
  },
)
