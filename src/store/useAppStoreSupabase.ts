import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { supabaseService } from '../lib/supabaseService'
import { DEFAULT_COUNTRIES } from '../lib/countries'
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
  setCurrentQuarter: (quarterId: string) => void
  addQuarter: (quarter: Omit<QuarterWithId, 'id'>) => void
  updateQuarter: (id: string, updates: Partial<QuarterWithId>) => void
  deleteQuarter: (id: string) => void
  getCurrentQuarter: () => QuarterWithId | null
  
  // Plan item actions
  addPlanItem: (item: Omit<PlanItem, 'id'>) => void
  updatePlanItem: (id: string, updates: Partial<PlanItem>) => void
  removePlanItem: (id: string) => void
  getCurrentQuarterItems: () => PlanItem[]
  
  // Team member actions
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void
  removeTeamMember: (id: string) => void
  getCurrentQuarterTeam: () => TeamMember[]
  
  // Holiday actions
  addHoliday: (holiday: Omit<Holiday, 'id'>) => void
  updateHoliday: (id: string, updates: Partial<Holiday>) => void
  removeHoliday: (id: string) => void
  getCurrentQuarterHolidays: () => Holiday[]
  
  // Settings actions
  updateSettings: (settings: Partial<Settings>) => void
  
  // Data loading
  loadData: () => Promise<void>
  saveData: () => Promise<void>
}

// Create the store
export const useAppStore = create<AppState & AppActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Selection actions
    setSelection: (selection) => set({ selection }),

    // Quarter actions
    setCurrentQuarter: (quarterId) => {
      set({ currentQuarterId: quarterId })
      get().saveData() // Auto-save when quarter changes
    },

    addQuarter: async (quarter) => {
      const newQuarter: QuarterWithId = {
        ...quarter,
        id: `q${Math.random().toString(36).substr(2, 9)}`,
      }
      
      set((state) => ({
        quarters: [...state.quarters, newQuarter],
      }))
      
      // Save to Supabase
      try {
        await supabaseService.createQuarter({
          id: newQuarter.id,
          name: newQuarter.name,
          description: newQuarter.description,
          start_iso: newQuarter.startISO,
          end_iso: newQuarter.endISO,
          is_current: false,
        })
      } catch (error) {
        console.error('Failed to save quarter to Supabase:', error)
      }
    },

    updateQuarter: async (id, updates) => {
      set((state) => ({
        quarters: state.quarters.map((q) =>
          q.id === id ? { ...q, ...updates } : q
        ),
      }))
      
      // Save to Supabase
      try {
        await supabaseService.updateQuarter(id, {
          name: updates.name,
          description: updates.description,
          start_iso: updates.startISO,
          end_iso: updates.endISO,
          is_current: updates.id === get().currentQuarterId,
        })
      } catch (error) {
        console.error('Failed to update quarter in Supabase:', error)
      }
    },

    deleteQuarter: async (id) => {
      set((state) => ({
        quarters: state.quarters.filter((q) => q.id !== id),
        currentQuarterId: state.currentQuarterId === id ? null : state.currentQuarterId,
      }))
      
      // Delete from Supabase
      try {
        await supabaseService.deleteQuarter(id)
      } catch (error) {
        console.error('Failed to delete quarter from Supabase:', error)
      }
    },

    getCurrentQuarter: () => {
      const { currentQuarterId, quarters } = get()
      return currentQuarterId ? quarters.find((q) => q.id === currentQuarterId) || null : null
    },

    // Plan item actions
    addPlanItem: async (item) => {
      const currentQuarter = get().getCurrentQuarter()
      if (!currentQuarter) return

      const newItem: PlanItem = {
        ...item,
        id: `item_${Math.random().toString(36).substr(2, 9)}`,
        quarterId: currentQuarter.id,
        adjustedDays: calculateAdjustedDays(item.baseDays, item.certainty, get().settings.certaintyMultipliers),
      }

      set((state) => ({
        items: [...state.items, newItem],
      }))
      
      // Save to Supabase
      try {
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
          jira_updated: newItem.jiraUpdated || null,
        })
      } catch (error) {
        console.error('Failed to save plan item to Supabase:', error)
      }
    },

    updatePlanItem: async (id, updates) => {
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id
            ? {
                ...item,
                ...updates,
                adjustedDays: updates.baseDays !== undefined || updates.certainty !== undefined
                  ? calculateAdjustedDays(
                      updates.baseDays ?? item.baseDays,
                      updates.certainty ?? item.certainty,
                      get().settings.certaintyMultipliers
                    )
                  : item.adjustedDays,
              }
            : item
        ),
      }))
      
      // Save to Supabase
      try {
        const item = get().items.find(i => i.id === id)
        if (item) {
          await supabaseService.updatePlanItem(id, {
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
        }
      } catch (error) {
        console.error('Failed to update plan item in Supabase:', error)
      }
    },

    removePlanItem: async (id) => {
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      }))
      
      // Delete from Supabase
      try {
        await supabaseService.deletePlanItem(id)
      } catch (error) {
        console.error('Failed to delete plan item from Supabase:', error)
      }
    },

    getCurrentQuarterItems: () => {
      const { currentQuarterId, items } = get()
      return currentQuarterId ? items.filter((item) => item.quarterId === currentQuarterId) : []
    },

    // Team member actions
    addTeamMember: async (member) => {
      const currentQuarter = get().getCurrentQuarter()
      if (!currentQuarter) return

      const newMember: TeamMember = {
        ...member,
        id: `member_${Math.random().toString(36).substr(2, 9)}`,
        quarterId: currentQuarter.id,
      }

      set((state) => ({
        team: [...state.team, newMember],
      }))
      
      // Save to Supabase
      try {
        await supabaseService.createTeamMember({
          id: newMember.id,
          quarter_id: newMember.quarterId,
          name: newMember.name,
          application: newMember.application || '',
          allocation_pct: newMember.allocationPct || 100,
          pto_days: newMember.ptoDays || 0,
          country: newMember.country || null,
        })
      } catch (error) {
        console.error('Failed to save team member to Supabase:', error)
      }
    },

    updateTeamMember: async (id, updates) => {
      set((state) => ({
        team: state.team.map((member) =>
          member.id === id ? { ...member, ...updates } : member
        ),
      }))
      
      // Save to Supabase
      try {
        const member = get().team.find(m => m.id === id)
        if (member) {
          await supabaseService.updateTeamMember(id, {
            name: member.name,
            application: member.application || '',
            allocation_pct: member.allocationPct || 100,
            pto_days: member.ptoDays || 0,
            country: member.country || null,
          })
        }
      } catch (error) {
        console.error('Failed to update team member in Supabase:', error)
      }
    },

    removeTeamMember: async (id) => {
      set((state) => ({
        team: state.team.filter((member) => member.id !== id),
      }))
      
      // Delete from Supabase
      try {
        await supabaseService.deleteTeamMember(id)
      } catch (error) {
        console.error('Failed to delete team member from Supabase:', error)
      }
    },

    getCurrentQuarterTeam: () => {
      const { currentQuarterId, team } = get()
      return currentQuarterId ? team.filter((member) => member.quarterId === currentQuarterId) : []
    },

    // Holiday actions
    addHoliday: async (holiday) => {
      const currentQuarter = get().getCurrentQuarter()
      if (!currentQuarter) return

      const newHoliday: Holiday = {
        ...holiday,
        id: `holiday_${Math.random().toString(36).substr(2, 9)}`,
        quarterId: currentQuarter.id,
      }

      set((state) => ({
        holidays: [...state.holidays, newHoliday],
      }))
      
      // Save to Supabase
      try {
        await supabaseService.createHoliday({
          id: newHoliday.id,
          quarter_id: newHoliday.quarterId,
          date_iso: newHoliday.dateISO,
          name: newHoliday.name,
          countries: newHoliday.countries || [],
        })
      } catch (error) {
        console.error('Failed to save holiday to Supabase:', error)
      }
    },

    updateHoliday: async (id, updates) => {
      set((state) => ({
        holidays: state.holidays.map((holiday) =>
          holiday.id === id ? { ...holiday, ...updates } : holiday
        ),
      }))
      
      // Save to Supabase
      try {
        const holiday = get().holidays.find(h => h.id === id)
        if (holiday) {
          await supabaseService.updateHoliday(id, {
            date_iso: holiday.dateISO,
            name: holiday.name,
            countries: holiday.countries || [],
          })
        }
      } catch (error) {
        console.error('Failed to update holiday in Supabase:', error)
      }
    },

    removeHoliday: async (id) => {
      set((state) => ({
        holidays: state.holidays.filter((holiday) => holiday.id !== id),
      }))
      
      // Delete from Supabase
      try {
        await supabaseService.deleteHoliday(id)
      } catch (error) {
        console.error('Failed to delete holiday from Supabase:', error)
      }
    },

    getCurrentQuarterHolidays: () => {
      const { currentQuarterId, holidays } = get()
      return currentQuarterId ? holidays.filter((holiday) => holiday.quarterId === currentQuarterId) : []
    },

    // Settings actions
    updateSettings: async (settings) => {
      set((state) => ({
        settings: { ...state.settings, ...settings },
      }))
      
      // Save to Supabase
      try {
        const currentSettings = get().settings
        await supabaseService.saveSettings({
          id: 'main-settings',
          certainty_multipliers: currentSettings.certaintyMultipliers,
          countries: currentSettings.countries,
          strict_app_matching: currentSettings.strictAppMatching,
          jira: currentSettings.jira || {},
        })
      } catch (error) {
        console.error('Failed to save settings to Supabase:', error)
      }
    },

    // Data loading
    loadData: async () => {
      try {
        // Load quarters
        const quarters = await supabaseService.getQuarters()
        const quartersData = quarters.map(q => ({
          id: q.id,
          name: q.name,
          description: q.description,
          startISO: q.start_iso,
          endISO: q.end_iso,
        }))

        // Load plan items
        const planItems = await supabaseService.getPlanItems()
        const itemsData = planItems.map(item => ({
          id: item.id,
          quarterId: item.quarter_id,
          type: item.type as 'Feature' | 'Story',
          key: item.key,
          title: item.title,
          label: item.label,
          application: item.application,
          baseDays: item.base_days,
          certainty: item.certainty as 'Low' | 'Mid' | 'High',
          adjustedDays: item.adjusted_days,
          notes: item.notes,
          jiraId: item.jira_id,
          jiraKey: item.jira_key,
          jiraStatus: item.jira_status,
          jiraPriority: item.jira_priority,
          jiraAssignee: item.jira_assignee,
          jiraSprint: item.jira_sprint,
          jiraCreated: item.jira_created,
          jiraUpdated: item.jira_updated,
        }))

        // Load team members
        const teamMembers = await supabaseService.getTeamMembers()
        const teamData = teamMembers.map(member => ({
          id: member.id,
          quarterId: member.quarter_id,
          name: member.name,
          application: member.application,
          allocationPct: member.allocation_pct,
          ptoDays: member.pto_days,
          country: member.country,
        }))

        // Load holidays
        const holidays = await supabaseService.getHolidays()
        const holidaysData = holidays.map(holiday => ({
          id: holiday.id,
          quarterId: holiday.quarter_id,
          dateISO: holiday.date_iso,
          name: holiday.name,
          countries: holiday.countries,
        }))

        // Load settings
        const settings = await supabaseService.getSettings()
        const settingsData = settings ? {
          certaintyMultipliers: settings.certainty_multipliers,
          countries: settings.countries,
          strictAppMatching: settings.strict_app_matching,
          jira: settings.jira,
        } : get().settings

        set({
          quarters: quartersData.length > 0 ? quartersData : [initialQuarter],
          items: itemsData,
          team: teamData,
          holidays: holidaysData,
          settings: settingsData,
        })
      } catch (error) {
        console.error('Failed to load data from Supabase:', error)
      }
    },

    saveData: async () => {
      // This is now handled by individual actions
      // No need for a separate save method
    },
  }))
)
