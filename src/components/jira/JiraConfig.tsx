import React, { useState } from 'react'
import { useJira } from '../../hooks/useJira'
import type { JiraConfig } from '../../lib/jira'

interface Props {
  onClose: () => void
}

const JiraConfig = ({ onClose }: Props) => {
  const { connect, disconnect, isLoading, error, isConnected, getJiraStatus, clearError } = useJira()
  const [config, setConfig] = useState<JiraConfig>({
    baseUrl: '',
    username: '',
    apiToken: '',
    projectKey: '',
  })
  const [showToken, setShowToken] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    const success = await connect(config)
    if (success) {
      onClose()
    }
  }

  const handleDisconnect = () => {
    disconnect()
    onClose()
  }

  const status = getJiraStatus()

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
          <div>
            <div className="font-medium text-gray-900">
              {status.connected ? 'Connected' : 'Not Connected'}
            </div>
            <div className="text-sm text-gray-600">{status.message}</div>
            {status.lastSync && (
              <div className="text-xs text-gray-500">
                Last sync: {new Date(status.lastSync).toLocaleString()}
              </div>
            )}
          </div>
        </div>
        {isConnected && (
          <button
            onClick={handleDisconnect}
            className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
          >
            Disconnect
          </button>
        )}
      </div>

      {/* Configuration Form */}
      {!isConnected && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jira URL
            </label>
            <input
              type="url"
              value={config.baseUrl}
              onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
              placeholder="https://yourcompany.atlassian.net"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username / Email
            </label>
            <input
              type="email"
              value={config.username}
              onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value }))}
              placeholder="your.email@company.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Token
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={config.apiToken}
                onChange={(e) => setConfig(prev => ({ ...prev, apiToken: e.target.value }))}
                placeholder="Your Jira API token"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showToken ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Generate an API token in your Jira account settings
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Key
            </label>
            <input
              type="text"
              value={config.projectKey}
              onChange={(e) => setConfig(prev => ({ ...prev, projectKey: e.target.value.toUpperCase() }))}
              placeholder="PROJ"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The project key (e.g., PROJ) where issues will be synced
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default JiraConfig


