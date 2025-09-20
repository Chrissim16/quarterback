import React, { useState } from 'react'
import type { AssignmentStrategy, ManualOverride } from '../../types'

interface AssignmentControlsProps {
  strategy: AssignmentStrategy
  onStrategyChange: (strategy: Partial<AssignmentStrategy>) => void
  manualOverrides: ManualOverride[]
  onAddOverride: (override: Omit<ManualOverride, 'id' | 'createdAt' | 'isActive'>) => void
  onRemoveOverride: (overrideId: string) => void
  strategyOptions: Array<{
    name: string
    description: string
    algorithm: string
    weights: Record<string, number>
  }>
}

const AssignmentControls: React.FC<AssignmentControlsProps> = ({
  strategy,
  onStrategyChange,
  manualOverrides,
  onAddOverride,
  onRemoveOverride,
  strategyOptions
}) => {
  const [showStrategyModal, setShowStrategyModal] = useState(false)
  const [showOverrideModal, setShowOverrideModal] = useState(false)
  const [newOverride, setNewOverride] = useState({
    itemId: '',
    memberId: '',
    daysAssigned: 0,
    reason: ''
  })

  const handleStrategySelect = (option: typeof strategyOptions[0]) => {
    onStrategyChange({
      name: option.name,
      description: option.description,
      algorithm: option.algorithm as any,
      weights: option.weights
    })
    setShowStrategyModal(false)
  }

  const handleAddOverride = () => {
    if (newOverride.itemId && newOverride.memberId && newOverride.daysAssigned > 0) {
      onAddOverride(newOverride)
      setNewOverride({ itemId: '', memberId: '', daysAssigned: 0, reason: '' })
      setShowOverrideModal(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Strategy Selection */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">Assignment Strategy</h3>
          <button
            onClick={() => setShowStrategyModal(true)}
            className="btn-secondary px-3 py-1 text-sm"
          >
            Change Strategy
          </button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{strategy.name}</span>
            <span className="text-xs text-gray-500">{strategy.algorithm}</span>
          </div>
          <p className="text-sm text-gray-600">{strategy.description}</p>
          
          {/* Strategy Weights */}
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Weights</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Skill Match:</span>
                <span className="font-medium">{(strategy.weights.skillMatch * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Workload Balance:</span>
                <span className="font-medium">{(strategy.weights.workloadBalance * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Priority:</span>
                <span className="font-medium">{(strategy.weights.priority * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Deadline:</span>
                <span className="font-medium">{(strategy.weights.deadline * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Overrides */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">Manual Overrides</h3>
          <button
            onClick={() => setShowOverrideModal(true)}
            className="btn-primary px-3 py-1 text-sm"
          >
            Add Override
          </button>
        </div>
        
        {manualOverrides.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No manual overrides</p>
        ) : (
          <div className="space-y-2">
            {manualOverrides.map(override => (
              <div key={override.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    Item: {override.itemId} → Member: {override.memberId}
                  </div>
                  <div className="text-xs text-gray-500">
                    {override.daysAssigned} days • {override.reason}
                  </div>
                </div>
                <button
                  onClick={() => onRemoveOverride(override.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Strategy Selection Modal */}
      {showStrategyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Assignment Strategy</h3>
            <div className="space-y-3">
              {strategyOptions.map(option => (
                <button
                  key={option.name}
                  onClick={() => handleStrategySelect(option)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    strategy.name === option.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{option.name}</h4>
                    <span className="text-xs text-gray-500">{option.algorithm}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Skill Match:</span>
                      <span>{(option.weights.skillMatch * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Workload Balance:</span>
                      <span>{(option.weights.workloadBalance * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Priority:</span>
                      <span>{(option.weights.priority * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deadline:</span>
                      <span>{(option.weights.deadline * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowStrategyModal(false)}
                className="btn-secondary px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Manual Override</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item ID
                </label>
                <input
                  type="text"
                  value={newOverride.itemId}
                  onChange={(e) => setNewOverride({ ...newOverride, itemId: e.target.value })}
                  className="input"
                  placeholder="Enter item ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member ID
                </label>
                <input
                  type="text"
                  value={newOverride.memberId}
                  onChange={(e) => setNewOverride({ ...newOverride, memberId: e.target.value })}
                  className="input"
                  placeholder="Enter member ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Days Assigned
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={newOverride.daysAssigned}
                  onChange={(e) => setNewOverride({ ...newOverride, daysAssigned: parseFloat(e.target.value) || 0 })}
                  className="input"
                  placeholder="Enter days"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <textarea
                  value={newOverride.reason}
                  onChange={(e) => setNewOverride({ ...newOverride, reason: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Why is this override needed?"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="btn-secondary px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOverride}
                disabled={!newOverride.itemId || !newOverride.memberId || newOverride.daysAssigned <= 0}
                className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssignmentControls
