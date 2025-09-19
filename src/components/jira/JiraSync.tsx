import React, { useState } from 'react'
import { useJira } from '../../hooks/useJira'
import { useAppStore } from '../../store/useAppStore'

interface Props {
  onSyncComplete?: (result: any) => void
}

const JiraSync = ({ onSyncComplete }: Props) => {
  const { syncFromJira, syncToJira, isLoading, error, isConnected, getJiraStatus } = useJira()
  const { items } = useAppStore()
  const [customJQL, setCustomJQL] = useState('')
  const [useCustomJQL, setUseCustomJQL] = useState(false)

  const handleSyncFromJira = async () => {
    const jql = useCustomJQL && customJQL.trim() ? customJQL : undefined
    const result = await syncFromJira(jql)
    if (result && onSyncComplete) {
      onSyncComplete(result)
    }
  }

  const handleSyncToJira = async () => {
    const result = await syncToJira()
    if (result && onSyncComplete) {
      onSyncComplete(result)
    }
  }

  const status = getJiraStatus()
  const jiraItems = items.filter(item => item.jiraKey)
  const localItems = items.filter(item => !item.jiraKey)

  if (!isConnected) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center">
          <span className="text-yellow-600 mr-2">⚠️</span>
          <span className="text-sm text-yellow-800">
            Jira is not connected. Configure it in Settings to enable sync.
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-sm font-medium text-gray-900">{status.message}</span>
        </div>
        {status.lastSync && (
          <span className="text-xs text-gray-500">
            Last sync: {new Date(status.lastSync).toLocaleString()}
          </span>
        )}
      </div>

      {/* Sync Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sync From Jira */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Sync From Jira</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useCustomJQL"
                checked={useCustomJQL}
                onChange={(e) => setUseCustomJQL(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="useCustomJQL" className="text-sm text-gray-700">
                Use custom JQL query
              </label>
            </div>

            {useCustomJQL && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  JQL Query
                </label>
                <textarea
                  value={customJQL}
                  onChange={(e) => setCustomJQL(e.target.value)}
                  placeholder="project = PROJ AND status = 'To Do'"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            )}

            <button
              onClick={handleSyncFromJira}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Syncing...' : 'Sync From Jira'}
            </button>
          </div>
        </div>

        {/* Sync To Jira */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Sync To Jira</h3>
          
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <div>Jira items: {jiraItems.length}</div>
              <div>Local items: {localItems.length}</div>
            </div>

            <button
              onClick={handleSyncToJira}
              disabled={isLoading || localItems.length === 0}
              className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Syncing...' : `Sync ${localItems.length} Items To Jira`}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}
    </div>
  )
}

export default JiraSync


