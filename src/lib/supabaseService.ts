// Supabase service layer for Quarterback - Temporarily disabled
// This file is temporarily disabled to prevent app crashes

export class SupabaseService {
  private userId: string | null = null

  // Initialize user (get or create) - Temporarily disabled
  async initializeUser(email: string): Promise<string> {
    // Temporarily return a mock user ID
    this.userId = 'mock-user-id'
    return 'mock-user-id'
  }

  // Get current user ID - Temporarily disabled
  getCurrentUserId(): string {
    return 'mock-user-id'
  }

  // All other methods temporarily disabled
  async getQuarters(): Promise<any[]> {
    return []
  }

  async createQuarter(quarter: any): Promise<any> {
    return quarter
  }

  async updateQuarter(id: string, quarter: any): Promise<any> {
    return quarter
  }

  async deleteQuarter(id: string): Promise<void> {
    return
  }

  async getPlanItems(): Promise<any[]> {
    return []
  }

  async createPlanItem(item: any): Promise<any> {
    return item
  }

  async updatePlanItem(id: string, item: any): Promise<any> {
    return item
  }

  async deletePlanItem(id: string): Promise<void> {
    return
  }

  async getTeamMembers(): Promise<any[]> {
    return []
  }

  async createTeamMember(member: any): Promise<any> {
    return member
  }

  async updateTeamMember(id: string, member: any): Promise<any> {
    return member
  }

  async deleteTeamMember(id: string): Promise<void> {
    return
  }

  async getHolidays(): Promise<any[]> {
    return []
  }

  async createHoliday(holiday: any): Promise<any> {
    return holiday
  }

  async updateHoliday(id: string, holiday: any): Promise<any> {
    return holiday
  }

  async deleteHoliday(id: string): Promise<void> {
    return
  }

  async getSettings(): Promise<any> {
    return null
  }

  async saveSettings(settings: any): Promise<any> {
    return settings
  }

  async getProposals(): Promise<any[]> {
    return []
  }

  async saveProposal(proposal: any): Promise<any> {
    return proposal
  }

  async migrateLocalStorageToSupabase(appState: any): Promise<void> {
    // Migration disabled
    return
  }
}

export const supabaseService = new SupabaseService()