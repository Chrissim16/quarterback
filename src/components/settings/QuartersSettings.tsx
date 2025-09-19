import React, { useState, useMemo } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { workingDaysBetween, validateDateRange, formatDateRange } from '../../lib/dates'
import type { QuarterWithId } from '../../types'

const QuartersSettings = () => {
  const { 
    quarters, 
    currentQuarterId, 
    updateQuarter, 
    removeQuarter, 
    setCurrentQuarter, 
    getCurrentQuarter 
  } = useAppStore()
  
  const currentQuarter = getCurrentQuarter()
  const [tempQuarter, setTempQuarter] = useState<QuarterWithId>(currentQuarter || {
    id: '',
    name: '',
    startISO: '',
    endISO: '',
  })
  const [isAddingQuarter, setIsAddingQuarter] = useState(false)
  const [newQuarter, setNewQuarter] = useState<Omit<QuarterWithId, 'id'>>({
    name: '',
    description: '',
    startISO: '',
    endISO: '',
  })

  // Calculate working days in quarter
  const workingDays = useMemo(() => {
    const validation = validateDateRange(tempQuarter.startISO, tempQuarter.endISO)
    if (!validation.isValid) return 0
    return workingDaysBetween(tempQuarter.startISO, tempQuarter.endISO)
  }, [tempQuarter.startISO, tempQuarter.endISO])

  const handleQuarterSelect = (quarter: QuarterWithId) => {
    setTempQuarter(quarter)
    setCurrentQuarter(quarter.id)
  }

  const handleQuarterUpdate = () => {
    updateQuarter(tempQuarter)
  }

  const handleAddQuarter = () => {
    if (newQuarter.name && newQuarter.startISO && newQuarter.endISO) {
      const validation = validateDateRange(newQuarter.startISO, newQuarter.endISO)
      if (validation.isValid) {
        useAppStore.getState().addQuarter(newQuarter)
        setNewQuarter({ name: '', description: '', startISO: '', endISO: '' })
        setIsAddingQuarter(false)
      }
    }
  }

  const handleRemoveQuarter = (quarterId: string) => {
    if (quarters.length > 1) {
      removeQuarter(quarterId)
      if (currentQuarterId === quarterId) {
        const remainingQuarters = quarters.filter(q => q.id !== quarterId)
        if (remainingQuarters.length > 0) {
          setCurrentQuarter(remainingQuarters[0].id)
        }
      }
    }
  }

  const validation = validateDateRange(tempQuarter.startISO, tempQuarter.endISO)
  const newQuarterValidation = validateDateRange(newQuarter.startISO, newQuarter.endISO)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Quarter Management</h2>
        <p className="text-gray-600 mt-1">Manage quarters and set the current working period.</p>
      </div>

      {/* Current Quarter Editor */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Current Quarter</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quarter Name</label>
            <input
              type="text"
              value={tempQuarter.name}
              onChange={(e) => setTempQuarter(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={tempQuarter.startISO}
              onChange={(e) => setTempQuarter(prev => ({ ...prev, startISO: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={tempQuarter.endISO}
              onChange={(e) => setTempQuarter(prev => ({ ...prev, endISO: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Working Days</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
              {validation.isValid ? `${workingDays} days` : 'Invalid date range'}
            </div>
          </div>
        </div>

        {!validation.isValid && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-800">{validation.error}</div>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={handleQuarterUpdate}
            disabled={!validation.isValid || !tempQuarter.name}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update Quarter
          </button>
        </div>
      </div>

      {/* Quarters List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">All Quarters</h3>
          <button
            onClick={() => setIsAddingQuarter(!isAddingQuarter)}
            className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
          >
            {isAddingQuarter ? 'Cancel' : 'Add Quarter'}
          </button>
        </div>

        {/* Add New Quarter Form */}
        {isAddingQuarter && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 mb-3">Add New Quarter</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quarter Name</label>
                <input
                  type="text"
                  value={newQuarter.name}
                  onChange={(e) => setNewQuarter(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newQuarter.description || ''}
                  onChange={(e) => setNewQuarter(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={newQuarter.startISO}
                  onChange={(e) => setNewQuarter(prev => ({ ...prev, startISO: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={newQuarter.endISO}
                  onChange={(e) => setNewQuarter(prev => ({ ...prev, endISO: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {!newQuarterValidation.isValid && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-sm text-red-800">{newQuarterValidation.error}</div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setIsAddingQuarter(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddQuarter}
                disabled={!newQuarterValidation.isValid || !newQuarter.name}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Quarter
              </button>
            </div>
          </div>
        )}

        {/* Quarters List */}
        <div className="space-y-3">
          {quarters.map((quarter) => {
            const isCurrent = quarter.id === currentQuarterId
            const quarterWorkingDays = workingDaysBetween(quarter.startISO, quarter.endISO)
            
            return (
              <div
                key={quarter.id}
                className={`p-4 border rounded-lg ${
                  isCurrent 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-gray-900">{quarter.name}</h4>
                      {isCurrent && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    {quarter.description && (
                      <p className="text-sm text-gray-600 mt-1">{quarter.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{formatDateRange(quarter.startISO, quarter.endISO)}</span>
                      <span>{quarterWorkingDays} working days</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!isCurrent && (
                      <button
                        onClick={() => handleQuarterSelect(quarter)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Set Current
                      </button>
                    )}
                    {quarters.length > 1 && (
                      <button
                        onClick={() => handleRemoveQuarter(quarter.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default QuartersSettings



