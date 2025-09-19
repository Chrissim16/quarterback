import React from 'react'
import JiraConfig from '../jira/JiraConfig'

const JiraSettings = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Jira Integration</h2>
        <p className="text-gray-600 mt-1">Connect to Jira to sync issues and manage your project backlog.</p>
      </div>

      {/* Jira Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <JiraConfig onClose={() => {}} />
      </div>

      {/* Integration Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Integration Features</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Sync From Jira</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Import issues as plan items</li>
              <li>• Map story points to base days</li>
              <li>• Preserve Jira metadata</li>
              <li>• Support custom JQL queries</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Sync To Jira</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Create new Jira issues</li>
              <li>• Update existing issues</li>
              <li>• Sync labels and descriptions</li>
              <li>• Maintain bidirectional sync</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Field Mapping */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Field Mapping</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jira Field
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quarterback Field
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Summary</td>
                <td className="px-4 py-3 text-sm text-gray-900">Title</td>
                <td className="px-4 py-3 text-sm text-gray-500">Issue title becomes plan item title</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Description</td>
                <td className="px-4 py-3 text-sm text-gray-900">Notes</td>
                <td className="px-4 py-3 text-sm text-gray-500">Issue description becomes notes</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Issue Type</td>
                <td className="px-4 py-3 text-sm text-gray-900">Type</td>
                <td className="px-4 py-3 text-sm text-gray-500">Mapped to Feature or Story</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Labels</td>
                <td className="px-4 py-3 text-sm text-gray-900">Label</td>
                <td className="px-4 py-3 text-sm text-gray-500">Comma-separated labels</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Story Points</td>
                <td className="px-4 py-3 text-sm text-gray-900">Base Days</td>
                <td className="px-4 py-3 text-sm text-gray-500">Custom field 10016</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Key</td>
                <td className="px-4 py-3 text-sm text-gray-900">Key</td>
                <td className="px-4 py-3 text-sm text-gray-500">Jira issue key (e.g., PROJ-123)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Setup Instructions</h3>
        
        <ol className="text-sm text-blue-800 space-y-2">
          <li>
            <strong>1. Get API Token:</strong> Go to your Jira account settings and generate an API token
          </li>
          <li>
            <strong>2. Find Project Key:</strong> Look for the project key in your Jira project URL (e.g., PROJ)
          </li>
          <li>
            <strong>3. Configure Connection:</strong> Enter your Jira URL, username, API token, and project key
          </li>
          <li>
            <strong>4. Test Connection:</strong> Click "Connect" to verify your credentials work
          </li>
          <li>
            <strong>5. Start Syncing:</strong> Use the Jira Sync feature in the Plan page to import/export data
          </li>
        </ol>
      </div>
    </div>
  )
}

export default JiraSettings



