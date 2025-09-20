import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import TestDataLoader from '../TestDataLoader'

const DatabaseSettings = () => {
  const { syncToSupabase, loadDataFromSupabase, quarters, removeQuarter } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSyncToSupabase = async () => {
    setIsLoading(true)
    setMessage(null)
    
    try {
      const result = await syncToSupabase()
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Sync failed: ${error.message}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadFromSupabase = async () => {
    setIsLoading(true)
    setMessage(null)
    
    try {
      const success = await loadDataFromSupabase()
      setMessage({
        type: success ? 'success' : 'error',
        text: success ? 'Data loaded from Supabase successfully' : 'No data found in Supabase'
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Load failed: ${error.message}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestConnection = () => {
    // Open the test page in a new tab
    window.open('/test-supabase.html', '_blank')
  }

  const handleCleanupDuplicates = async () => {
    setIsLoading(true)
    setMessage(null)
    
    try {
      // Find duplicate quarters by name
      const quarterGroups = quarters.reduce((groups, quarter) => {
        const name = quarter.name
        if (!groups[name]) {
          groups[name] = []
        }
        groups[name].push(quarter)
        return groups
      }, {} as Record<string, typeof quarters>)
      
      let removedCount = 0
      
      // Remove duplicates, keeping the first one
      for (const [name, duplicateQuarters] of Object.entries(quarterGroups)) {
        if (duplicateQuarters.length > 1) {
          // Keep the first one, remove the rest
          const toRemove = duplicateQuarters.slice(1)
          for (const quarter of toRemove) {
            await removeQuarter(quarter.id)
            removedCount++
          }
        }
      }
      
      setMessage({
        type: 'success',
        text: `Cleanup completed! Removed ${removedCount} duplicate quarters.`
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Cleanup failed: ${error.message}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetAllData = async () => {
    if (!confirm('⚠️ WARNING: This will delete ALL data (quarters, items, team, holidays, settings) from both the app and Supabase. This cannot be undone. Are you sure?')) {
      return
    }

    setIsLoading(true)
    setMessage(null)
    
    try {
      // Clear localStorage
      localStorage.removeItem('quarterback-app-state')
      localStorage.removeItem('quarterback-migration-completed')
      
      // Clear all Supabase data
      const { supabase } = await import('../../lib/supabase')
      
      // Delete all data from Supabase (in correct order due to foreign keys)
      await supabase.from('proposals').delete().neq('id', '')
      await supabase.from('plan_items').delete().neq('id', '')
      await supabase.from('team_members').delete().neq('id', '')
      await supabase.from('holidays').delete().neq('id', '')
      await supabase.from('quarters').delete().neq('id', '')
      await supabase.from('settings').delete().neq('id', '')
      
      // Reload the page to reset the app state
      window.location.reload()
      
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Reset failed: ${error.message}`
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Database Management</h2>
        <p className="text-gray-600">
          Manage your data synchronization with Supabase. Your data is automatically saved to both 
          localStorage (for offline access) and Supabase (for cloud sync).
        </p>
      </div>

      {/* Connection Status */}
      <div className="card p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Connection Status</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Supabase Connected</span>
          </div>
          <button
            onClick={handleTestConnection}
            className="btn-secondary text-sm px-3 py-1"
          >
            Test Connection
          </button>
        </div>
      </div>

      {/* Sync Actions */}
      <div className="card p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Data Synchronization</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSyncToSupabase}
              disabled={isLoading}
              className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Syncing...' : 'Sync to Supabase'}
            </button>
            <span className="text-sm text-gray-600">
              Upload your current data to Supabase
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLoadFromSupabase}
              disabled={isLoading}
              className="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Load from Supabase'}
            </button>
            <span className="text-sm text-gray-600">
              Download data from Supabase (overwrites current data)
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCleanupDuplicates}
              disabled={isLoading}
              className="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Cleaning...' : 'Cleanup Duplicates'}
            </button>
            <span className="text-sm text-gray-600">
              Remove duplicate quarters and other data
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleResetAllData}
              disabled={isLoading}
              className="btn-danger px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Reset All Data'}
            </button>
            <span className="text-sm text-red-600">
              ⚠️ Delete ALL data from app and Supabase (cannot be undone)
            </span>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`card p-4 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center">
            <div className={`w-5 h-5 mr-3 ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {message.type === 'success' ? (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {message.text}
            </span>
          </div>
        </div>
      )}

      {/* Test Data Section */}
      <TestDataLoader />

      {/* Help Section */}
      <div className="card p-4 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Need Help?</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Data Loss Issue:</strong> If you're experiencing data loss after updates, 
            try syncing your data to Supabase first, then loading it back.
          </p>
          <p>
            <strong>First Time Setup:</strong> If this is your first time using Supabase, 
            make sure you've set up the database schema using the SQL file provided.
          </p>
          <p>
            <strong>Connection Issues:</strong> Use the "Test Connection" button to verify 
            your Supabase setup is working correctly.
          </p>
        </div>
      </div>
    </div>
  )
}

export default DatabaseSettings
