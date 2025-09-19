import { useState } from 'react'
import { hasValidApplication } from '../../lib/apps'
import type { PlanItem } from '../../types'

interface Props {
  item: PlanItem
  onEdit: (partial: Partial<PlanItem> & { id: string }) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
}

const PlanRecordCard = ({ item, onEdit, onDelete, onDuplicate }: Props) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: item.title,
    application: item.application || '',
    label: item.label || '',
    notes: item.notes || '',
  })

  const handleFieldChange = (field: keyof typeof editData, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    onEdit({
      id: item.id,
      ...editData,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData({
      title: item.title,
      application: item.application || '',
      label: item.label || '',
      notes: item.notes || '',
    })
    setIsEditing(false)
  }

  const handleBaseDaysChange = (delta: number) => {
    const newBaseDays = Math.max(0, (item.baseDays || 1) + delta)
    onEdit({
      id: item.id,
      baseDays: newBaseDays,
    })
  }

  const handleCertaintyChange = (certainty: 'Low' | 'Mid' | 'High') => {
    onEdit({
      id: item.id,
      certainty,
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Feature':
        return 'bg-blue-100 text-blue-800'
      case 'Story':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCertaintyColor = (certainty: string) => {
    switch (certainty) {
      case 'High':
        return 'bg-green-100 text-green-800'
      case 'Mid':
        return 'bg-yellow-100 text-yellow-800'
      case 'Low':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Main Row */}
      <div className="flex items-center justify-between">
        {/* Left Section - Avatar, Title, Key */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm ${getTypeColor(item.type || '')}`}>
            {item.type?.charAt(0) || 'I'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
              {item.key && (
                <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                  {item.key}
                </span>
              )}
            </div>
            {item.notes && (
              <p className="text-sm text-gray-500 truncate mt-1" title={item.notes}>
                {item.notes}
              </p>
            )}
          </div>
        </div>

        {/* Center Section - Meta Chips */}
        <div className="flex items-center space-x-2 mx-4">
          {item.application && (
            <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs shadow-sm bg-gray-50 text-gray-700">
              {item.application}
            </span>
          )}
          {item.label && (
            <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs shadow-sm bg-purple-50 text-purple-700">
              {item.label}
            </span>
          )}
          <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs shadow-sm ${getCertaintyColor(item.certainty || '')}`}>
            {item.certainty || 'Mid'}
          </span>
        </div>

        {/* Right Section - Controls and Actions */}
        <div className="flex items-center space-x-4">
          {/* Base Days Control */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleBaseDaysChange(-0.5)}
              className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-xs hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              −
            </button>
            <input
              type="number"
              min="0"
              step="0.5"
              value={item.baseDays || 1}
              onChange={(e) => onEdit({
                id: item.id,
                baseDays: Math.max(0, parseFloat(e.target.value) || 1)
              })}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={() => handleBaseDaysChange(0.5)}
              className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-xs hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              +
            </button>
          </div>

          {/* Certainty Control */}
          <select
            value={item.certainty || 'Mid'}
            onChange={(e) => handleCertaintyChange(e.target.value as 'Low' | 'Mid' | 'High')}
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="High">High</option>
            <option value="Mid">Mid</option>
            <option value="Low">Low</option>
          </select>

          {/* Adjusted Days Display */}
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {item.adjustedDays?.toFixed(1) || '0.0'}d
            </div>
            {!hasValidApplication(item.application) && (
              <span className="text-orange-500 text-xs" title="Application required for assignment">
                ⚠️
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDuplicate(item.id)}
              className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
            >
              Duplicate
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Inline Edit Form */}
      {isEditing && (
        <div className="border-t pt-3 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Application</label>
            <input
              type="text"
              value={editData.application}
              onChange={(e) => handleFieldChange('application', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
            <input
              type="text"
              value={editData.label}
              onChange={(e) => handleFieldChange('label', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
            <textarea
              value={editData.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              rows={2}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default PlanRecordCard
