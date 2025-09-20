import React from 'react'
import type { AssignmentMetrics } from '../../types'

interface AssignmentMetricsProps {
  metrics: AssignmentMetrics | null
  className?: string
}

const AssignmentMetrics: React.FC<AssignmentMetricsProps> = ({ metrics, className = '' }) => {
  if (!metrics) {
    return (
      <div className={`card p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>No assignment data available</p>
        </div>
      </div>
    )
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-emerald-600'
    if (efficiency >= 70) return 'text-amber-600'
    return 'text-red-600'
  }

  const getEfficiencyBg = (efficiency: number) => {
    if (efficiency >= 90) return 'bg-emerald-100'
    if (efficiency >= 70) return 'bg-amber-100'
    return 'bg-red-100'
  }

  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Assignment Metrics</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getEfficiencyBg(metrics.efficiency)} ${getEfficiencyColor(metrics.efficiency)}`}>
          {metrics.efficiency.toFixed(1)}% Efficiency
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Assignment Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Assignment Status</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Fully Assigned</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(metrics.fullyAssigned / metrics.totalItems) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{metrics.fullyAssigned}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Partially Assigned</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(metrics.partiallyAssigned / metrics.totalItems) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{metrics.partiallyAssigned}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Unassigned</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(metrics.unassigned / metrics.totalItems) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{metrics.unassigned}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Quality Metrics</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Average Skill Match</span>
                <span className="text-sm font-medium text-gray-900">{metrics.averageSkillMatch.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.averageSkillMatch}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Workload Variance</span>
                <span className="text-sm font-medium text-gray-900">{metrics.workloadVariance.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    metrics.workloadVariance < 0.1 ? 'bg-emerald-500' : 
                    metrics.workloadVariance < 0.3 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(metrics.workloadVariance * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Risk Indicators */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Risk Indicators</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">Dependency Blocked</div>
                <div className="text-xs text-gray-500">Items waiting for dependencies</div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                metrics.dependencyBlocked === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {metrics.dependencyBlocked}
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">Deadline At Risk</div>
                <div className="text-xs text-gray-500">Items with low confidence</div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                metrics.deadlineAtRisk === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {metrics.deadlineAtRisk}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{metrics.totalItems}</div>
            <div className="text-sm text-gray-500">Total Items</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{metrics.fullyAssigned}</div>
            <div className="text-sm text-gray-500">Fully Assigned</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">{metrics.partiallyAssigned}</div>
            <div className="text-sm text-gray-500">Partially Assigned</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{metrics.unassigned}</div>
            <div className="text-sm text-gray-500">Unassigned</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignmentMetrics
