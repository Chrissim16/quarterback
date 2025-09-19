import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { workingDaysBetween, validateDateRange } from '../../lib/dates'
import { downloadData, uploadData } from '../../lib/export'
import { migrateLocalStorageToSupabase, hasCompletedMigration, getMigrationDate } from '../../lib/migrateToSupabase'
import { DataRecoveryService } from '../../lib/dataRecovery'
import SupabaseConfig from '../supabase/SupabaseConfig'

const GeneralSettings = () => {
  const { settings, updateSettings, getCurrentQuarter, items, team, holidays, quarters } = useAppStore()
  const currentQuarter = getCurrentQuarter()
  
  const [tempMultipliers, setTempMultipliers] = useState(settings.certaintyMultipliers)
  const [hasChanges, setHasChanges] = useState(false)
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })
  const [migrationStatus, setMigrationStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })
  const [isMigrating, setIsMigrating] = useState(false)
  const [recoveryStatus, setRecoveryStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })
  const [isRecovering, setIsRecovering] = useState(false)
  const [availableBackups, setAvailableBackups] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load available backups on mount
  useEffect(() => {
    setAvailableBackups(DataRecoveryService.listBackups())
  }, [])

  // Calculate working days in quarter
  const workingDays = useMemo(() => {
    if (!currentQuarter) return 0
    const validation = validateDateRange(currentQuarter.startISO, currentQuarter.endISO)
    if (!validation.isValid) return 0
    return workingDaysBetween(currentQuarter.startISO, currentQuarter.endISO)
  }, [currentQuarter])

  const handleMultiplierChange = (level: 'Low' | 'Mid' | 'High', value: number) => {
    const newMultipliers = { ...tempMultipliers, [level]: value }
    setTempMultipliers(newMultipliers)
    setHasChanges(true)
  }

  const handleSave = () => {
    updateSettings({ certaintyMultipliers: tempMultipliers })
    setHasChanges(false)
  }

  const handleReset = () => {
    setTempMultipliers(settings.certaintyMultipliers)
    setHasChanges(false)
  }

  const validateMultipliers = () => {
    const { Low, Mid, High } = tempMultipliers
    return Low >= Mid && Mid >= High && Low > 0 && Mid > 0 && High > 0
  }

  const isValid = validateMultipliers()

  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0]
    downloadData(`quarterback-backup-${timestamp}.json`)
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const result = await uploadData(file)
    if (result.success) {
      setImportStatus({ type: 'success', message: 'Data imported successfully!' })
    } else {
      setImportStatus({ type: 'error', message: result.error || 'Import failed' })
    }

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    // Clear status after 3 seconds
    setTimeout(() => setImportStatus({ type: null, message: '' }), 3000)
  }

  const handleMigration = async () => {
    setIsMigrating(true)
    setMigrationStatus({ type: null, message: '' })
    
    try {
      const result = await migrateLocalStorageToSupabase()
      setMigrationStatus({ 
        type: result.success ? 'success' : 'error', 
        message: result.message 
      })
      setTimeout(() => setMigrationStatus({ type: null, message: '' }), 5000)
    } catch (error) {
      setMigrationStatus({ 
        type: 'error', 
        message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      })
      setTimeout(() => setMigrationStatus({ type: null, message: '' }), 5000)
    } finally {
      setIsMigrating(false)
    }
  }

  const handleRecoverFromSupabase = async () => {
    setIsRecovering(true)
    setRecoveryStatus({ type: null, message: '' })
    
    try {
      const success = await DataRecoveryService.restoreFromSupabase()
      if (success) {
        setRecoveryStatus({ 
          type: 'success', 
          message: 'Data successfully restored from Supabase! Please refresh the page.' 
        })
        // Refresh the page to reload the store
        setTimeout(() => window.location.reload(), 2000)
      } else {
        setRecoveryStatus({ 
          type: 'error', 
          message: 'Failed to restore data from Supabase. Please check your connection.' 
        })
      }
      setTimeout(() => setRecoveryStatus({ type: null, message: '' }), 5000)
    } catch (error) {
      setRecoveryStatus({ 
        type: 'error', 
        message: `Recovery failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      })
      setTimeout(() => setRecoveryStatus({ type: null, message: '' }), 5000)
    } finally {
      setIsRecovering(false)
    }
  }

  const handleRestoreFromBackup = (backupKey: string) => {
    const success = DataRecoveryService.restoreFromBackup(backupKey)
    if (success) {
      setRecoveryStatus({ 
        type: 'success', 
        message: 'Data restored from backup! Please refresh the page.' 
      })
      // Refresh the page to reload the store
      setTimeout(() => window.location.reload(), 2000)
    } else {
      setRecoveryStatus({ 
        type: 'error', 
        message: 'Failed to restore from backup.' 
      })
    }
    setTimeout(() => setRecoveryStatus({ type: null, message: '' }), 5000)
  }

  const handleCreateBackup = () => {
    const backupKey = DataRecoveryService.createBackup()
    setAvailableBackups(DataRecoveryService.listBackups())
    setRecoveryStatus({ 
      type: 'success', 
      message: `Backup created: ${backupKey}` 
    })
    setTimeout(() => setRecoveryStatus({ type: null, message: '' }), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">General Settings</h2>
        <p className="text-gray-600 mt-1">Configure basic application settings and multipliers.</p>
      </div>

            {/* Supabase Database Setup */}
            <SupabaseConfig onConfigured={(email) => {
              console.log('Supabase configured for:', email)
            }} />

      {/* Certainty Multipliers */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Certainty Multipliers</h3>
        <p className="text-sm text-gray-600 mb-6">
          Adjust how base days are multiplied based on certainty level. Higher uncertainty = higher multiplier.
        </p>

        <div className="space-y-4">
          {(['Low', 'Mid', 'High'] as const).map((level) => (
            <div key={level} className="flex items-center justify-between">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {level} Certainty
                </label>
                <p className="text-xs text-gray-500">
                  {level === 'Low' && 'High uncertainty, complex requirements'}
                  {level === 'Mid' && 'Medium uncertainty, some unknowns'}
                  {level === 'High' && 'Low uncertainty, well-defined scope'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1.0"
                  max="5.0"
                  step="0.05"
                  value={tempMultipliers[level]}
                  onChange={(e) => handleMultiplierChange(level, parseFloat(e.target.value) || 1.0)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">×</span>
              </div>
            </div>
          ))}
        </div>

        {/* Validation Messages */}
        {!isValid && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-800">
              <strong>Invalid multipliers:</strong> Low ≥ Mid ≥ High, and all must be ≥ 1.0
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || !isValid}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Current Quarter Info */}
      {currentQuarter && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Quarter</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-700">Quarter Name</div>
              <div className="text-lg text-gray-900">{currentQuarter.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Date Range</div>
              <div className="text-lg text-gray-900">
                {new Date(currentQuarter.startISO).toLocaleDateString()} - {new Date(currentQuarter.endISO).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Working Days</div>
              <div className="text-lg text-gray-900">{workingDays} days</div>
            </div>
          </div>
        </div>
      )}

      {/* Application Matching */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Assignment Rules</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700">Strict Application Matching</div>
            <div className="text-xs text-gray-500">
              Items can only be assigned to team members with matching applications
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.strictAppMatching}
              onChange={(e) => updateSettings({ strictAppMatching: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Data Export/Import */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Management</h3>
        <p className="text-sm text-gray-600 mb-6">
          Export your data to backup or share between browsers/devices. Import previously exported data.
        </p>

        {/* Status Messages */}
        {importStatus.type && (
          <div className={`mb-4 p-3 rounded-lg ${
            importStatus.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {importStatus.message}
          </div>
        )}

        {migrationStatus.type && (
          <div className={`mb-4 p-3 rounded-lg ${
            migrationStatus.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {migrationStatus.message}
          </div>
        )}

        {recoveryStatus.type && (
          <div className={`mb-4 p-3 rounded-lg ${
            recoveryStatus.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {recoveryStatus.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Export */}
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Export Data</h4>
            <p className="text-xs text-gray-500 mb-3">
              Download all your data as a JSON file
            </p>
            <button
              onClick={handleExport}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              📥 Export Data
            </button>
          </div>

          {/* Import */}
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Import Data</h4>
            <p className="text-xs text-gray-500 mb-3">
              Upload a previously exported JSON file
            </p>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              >
                📤 Import Data
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800">
            <strong>⚠️ Important:</strong> Importing data will replace all current data. Make sure to export first if you want to keep your current data.
          </div>
        </div>

        {/* Supabase Migration */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Supabase Migration</h4>
          <p className="text-xs text-blue-700 mb-3">
            Migrate your localStorage data to Supabase for cross-device sync and backup.
          </p>
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-800">
              {hasCompletedMigration() ? (
                <span>✅ Migration completed on {getMigrationDate() ? new Date(getMigrationDate()!).toLocaleDateString() : 'unknown date'}</span>
              ) : (
                <span>Ready to migrate {items.length} items, {team.length} team members, {holidays.length} holidays, and {quarters.length} quarters</span>
              )}
            </div>
            <button
              onClick={handleMigration}
              disabled={isMigrating || hasCompletedMigration()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {isMigrating ? 'Migrating...' : hasCompletedMigration() ? 'Already Migrated' : '🚀 Migrate to Supabase'}
            </button>
          </div>
        </div>

        {/* Data Recovery */}
        <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h4 className="text-sm font-medium text-orange-900 mb-2">Data Recovery</h4>
          <p className="text-xs text-orange-700 mb-3">
            If you've lost data, you can restore it from Supabase or from a local backup.
          </p>
          
          <div className="space-y-3">
            {/* Restore from Supabase */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-orange-800">Restore from Supabase</div>
                <div className="text-xs text-orange-600">Download all data from your Supabase database</div>
              </div>
              <button
                onClick={handleRecoverFromSupabase}
                disabled={isRecovering}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              >
                {isRecovering ? 'Restoring...' : '🔄 Restore from Supabase'}
              </button>
            </div>

            {/* Create Backup */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-orange-800">Create Local Backup</div>
                <div className="text-xs text-orange-600">Save current data as a local backup</div>
              </div>
              <button
                onClick={handleCreateBackup}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                💾 Create Backup
              </button>
            </div>

            {/* Restore from Backup */}
            {availableBackups.length > 0 && (
              <div>
                <div className="text-sm font-medium text-orange-800 mb-2">Restore from Local Backup</div>
                <div className="space-y-1">
                  {availableBackups.slice(0, 5).map((backupKey) => (
                    <div key={backupKey} className="flex items-center justify-between text-xs">
                      <span className="text-orange-600 font-mono">{backupKey}</span>
                      <button
                        onClick={() => handleRestoreFromBackup(backupKey)}
                        className="px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                  {availableBackups.length > 5 && (
                    <div className="text-xs text-orange-500">
                      ... and {availableBackups.length - 5} more backups
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Data Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Current Data Summary</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Plan Items</div>
              <div className="font-medium text-gray-900">{items.length}</div>
            </div>
            <div>
              <div className="text-gray-500">Team Members</div>
              <div className="font-medium text-gray-900">{team.length}</div>
            </div>
            <div>
              <div className="text-gray-500">Holidays</div>
              <div className="font-medium text-gray-900">{holidays.length}</div>
            </div>
            <div>
              <div className="text-gray-500">Quarters</div>
              <div className="font-medium text-gray-900">{quarters.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GeneralSettings

