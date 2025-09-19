import { supabase } from './supabase';
import { AppState } from '../types';

/**
 * Data Recovery Service
 * Handles restoring data from Supabase to localStorage
 */
export class DataRecoveryService {
  /**
   * Restore all data from Supabase to localStorage
   */
  static async restoreFromSupabase(): Promise<boolean> {
    try {
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      // Get all data from Supabase
      const [quartersResult, itemsResult, teamResult, holidaysResult, settingsResult] = await Promise.all([
        supabase.from('quarters').select('*'),
        supabase.from('plan_items').select('*'),
        supabase.from('team_members').select('*'),
        supabase.from('holidays').select('*'),
        supabase.from('settings').select('*')
      ]);

      // Check for errors
      if (quartersResult.error) throw quartersResult.error;
      if (itemsResult.error) throw itemsResult.error;
      if (teamResult.error) throw teamResult.error;
      if (holidaysResult.error) throw holidaysResult.error;
      if (settingsResult.error) throw settingsResult.error;

      // Build the app state
      const appState: AppState = {
        quarters: quartersResult.data || [],
        items: itemsResult.data || [],
        team: teamResult.data || [],
        holidays: holidaysResult.data || [],
        settings: settingsResult.data || [],
        currentQuarterId: quartersResult.data?.[0]?.id || null,
        proposals: [] // Proposals not implemented yet
      };

      // Save to localStorage
      localStorage.setItem('quarterback-app-state', JSON.stringify(appState));
      
      console.log('Data restored from Supabase to localStorage');
      return true;
    } catch (error) {
      console.error('Failed to restore data from Supabase:', error);
      return false;
    }
  }

  /**
   * Create a backup of current localStorage data
   */
  static createBackup(): string {
    const currentData = localStorage.getItem('quarterback-app-state');
    const backupData = {
      timestamp: new Date().toISOString(),
      data: currentData ? JSON.parse(currentData) : null
    };
    
    const backupKey = `quarterback-backup-${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(backupData));
    
    return backupKey;
  }

  /**
   * Restore from a specific backup
   */
  static restoreFromBackup(backupKey: string): boolean {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        throw new Error('Backup not found');
      }

      const { data } = JSON.parse(backupData);
      if (!data) {
        throw new Error('Backup data is empty');
      }

      localStorage.setItem('quarterback-app-state', JSON.stringify(data));
      console.log('Data restored from backup:', backupKey);
      return true;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      return false;
    }
  }

  /**
   * List all available backups
   */
  static listBackups(): string[] {
    const backups: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('quarterback-backup-')) {
        backups.push(key);
      }
    }
    return backups.sort().reverse(); // Most recent first
  }
}
