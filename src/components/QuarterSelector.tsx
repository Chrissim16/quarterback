import React, { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { workingDaysBetween, validateDateRange } from '../lib/dates'
import type { QuarterWithId } from '../types'

interface QuarterSelectorProps {
  onQuarterSelected: () => void
}

const QuarterSelector: React.FC<QuarterSelectorProps> = ({ onQuarterSelected }) => {
  const { quarters, addQuarter, setCurrentQuarter } = useAppStore()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newQuarter, setNewQuarter] = useState({
    name: '',
    description: '',
    startISO: '',
    endISO: '',
    label: ''
  })

  const handleSelectQuarter = (quarterId: string) => {
    setCurrentQuarter(quarterId)
    onQuarterSelected()
  }

  const handleCreateQuarter = () => {
    if (!newQuarter.name || !newQuarter.startISO || !newQuarter.endISO) {
      alert('Please fill in all required fields')
      return
    }

    const validation = validateDateRange(newQuarter.startISO, newQuarter.endISO)
    if (!validation.isValid) {
      alert(validation.error)
      return
    }

    addQuarter(newQuarter)
    setShowCreateForm(false)
    setNewQuarter({ name: '', description: '', startISO: '', endISO: '', label: '' })
  }

  const workingDays = newQuarter.startISO && newQuarter.endISO 
    ? workingDaysBetween(newQuarter.startISO, newQuarter.endISO)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Quarterback</h1>
          <p className="text-gray-600">Select or create a quarter to get started</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {!showCreateForm ? (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Quarter</h2>
              
              {quarters.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No quarters available</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Create Your First Quarter
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {quarters.map((quarter) => (
                    <div
                      key={quarter.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleSelectQuarter(quarter.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{quarter.name}</h3>
                          {quarter.description && (
                            <p className="text-sm text-gray-500 mt-1">{quarter.description}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(quarter.startISO).toLocaleDateString()} - {new Date(quarter.endISO).toLocaleDateString()}
                          </p>
                          {quarter.label && (
                            <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {quarter.label}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {workingDaysBetween(quarter.startISO, quarter.endISO)} working days
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="w-full mt-4 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    + Create New Quarter
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Quarter</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quarter Name *
                  </label>
                  <input
                    type="text"
                    value={newQuarter.name}
                    onChange={(e) => setNewQuarter({ ...newQuarter, name: e.target.value })}
                    placeholder="e.g., Q4 2025"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newQuarter.description}
                    onChange={(e) => setNewQuarter({ ...newQuarter, description: e.target.value })}
                    placeholder="e.g., Fourth Quarter 2025"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jira Label
                  </label>
                  <input
                    type="text"
                    value={newQuarter.label}
                    onChange={(e) => setNewQuarter({ ...newQuarter, label: e.target.value })}
                    placeholder="e.g., 25Q4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={newQuarter.startISO}
                      onChange={(e) => setNewQuarter({ ...newQuarter, startISO: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={newQuarter.endISO}
                      onChange={(e) => setNewQuarter({ ...newQuarter, endISO: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {workingDays > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>{workingDays} working days</strong> in this quarter
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateQuarter}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Create Quarter
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuarterSelector
