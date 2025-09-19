// Supabase client configuration
import { createClient } from '@supabase/supabase-js'

// These will be set via environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Temporarily disabled to prevent app crashes
export const supabase = null

// Database table names
export const TABLES = {
  USERS: 'users',
  QUARTERS: 'quarters',
  PLAN_ITEMS: 'plan_items',
  TEAM_MEMBERS: 'team_members',
  HOLIDAYS: 'holidays',
  SETTINGS: 'settings',
  PROPOSALS: 'proposals',
} as const

// Database schema types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          updated_at?: string
        }
      }
      quarters: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          start_iso: string
          end_iso: string
          is_current: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          name: string
          description: string
          start_iso: string
          end_iso: string
          is_current?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          start_iso?: string
          end_iso?: string
          is_current?: boolean
          updated_at?: string
        }
      }
      plan_items: {
        Row: {
          id: string
          user_id: string
          quarter_id: string
          type: string
          key: string
          title: string
          label: string
          application: string
          base_days: number
          certainty: string
          adjusted_days: number
          notes: string
          jira_id: string | null
          jira_key: string | null
          jira_status: string | null
          jira_priority: string | null
          jira_assignee: string | null
          jira_sprint: string | null
          jira_created: string | null
          jira_updated: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          quarter_id: string
          type: string
          key: string
          title: string
          label: string
          application: string
          base_days: number
          certainty: string
          adjusted_days: number
          notes: string
          jira_id?: string | null
          jira_key?: string | null
          jira_status?: string | null
          jira_priority?: string | null
          jira_assignee?: string | null
          jira_sprint?: string | null
          jira_created?: string | null
          jira_updated?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quarter_id?: string
          type?: string
          key?: string
          title?: string
          label?: string
          application?: string
          base_days?: number
          certainty?: string
          adjusted_days?: number
          notes?: string
          jira_id?: string | null
          jira_key?: string | null
          jira_status?: string | null
          jira_priority?: string | null
          jira_assignee?: string | null
          jira_sprint?: string | null
          jira_created?: string | null
          jira_updated?: string | null
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          user_id: string
          name: string
          application: string
          allocation_pct: number
          pto_days: number
          country: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          name: string
          application: string
          allocation_pct: number
          pto_days: number
          country?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          application?: string
          allocation_pct?: number
          pto_days?: number
          country?: string | null
          updated_at?: string
        }
      }
      holidays: {
        Row: {
          id: string
          user_id: string
          quarter_id: string
          date_iso: string
          name: string
          countries: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          quarter_id: string
          date_iso: string
          name: string
          countries: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quarter_id?: string
          date_iso?: string
          name?: string
          countries?: string[]
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          user_id: string
          certainty_multipliers: {
            Low: number
            Mid: number
            High: number
          }
          countries: Array<{ code: string; name: string }>
          strict_app_matching: boolean
          jira: {
            base_url: string
            username: string
            project_key: string
            is_connected: boolean
            last_sync: string | null
          }
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          certainty_multipliers: {
            Low: number
            Mid: number
            High: number
          }
          countries: Array<{ code: string; name: string }>
          strict_app_matching: boolean
          jira: {
            base_url: string
            username: string
            project_key: string
            is_connected: boolean
            last_sync: string | null
          }
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          certainty_multipliers?: {
            Low: number
            Mid: number
            High: number
          }
          countries?: Array<{ code: string; name: string }>
          strict_app_matching?: boolean
          jira?: {
            base_url: string
            username: string
            project_key: string
            is_connected: boolean
            last_sync: string | null
          }
          updated_at?: string
        }
      }
      proposals: {
        Row: {
          id: string
          user_id: string
          quarter_id: string
          generated_at_iso: string
          items: Array<{
            itemId: string
            itemTitle: string
            application: string
            unassignedDays?: number
            status: 'fully-assigned' | 'partially-assigned' | 'unassigned'
            allocations: Array<{
              memberId: string
              name: string
              daysAssigned: number
            }>
          }>
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          quarter_id: string
          generated_at_iso: string
          items: Array<{
            itemId: string
            itemTitle: string
            application: string
            unassignedDays?: number
            status: 'fully-assigned' | 'partially-assigned' | 'unassigned'
            allocations: Array<{
              memberId: string
              name: string
              daysAssigned: number
            }>
          }>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quarter_id?: string
          generated_at_iso?: string
          items?: Array<{
            itemId: string
            itemTitle: string
            application: string
            unassignedDays?: number
            status: 'fully-assigned' | 'partially-assigned' | 'unassigned'
            allocations: Array<{
              memberId: string
              name: string
              daysAssigned: number
            }>
          }>
          updated_at?: string
        }
      }
    }
  }
}
