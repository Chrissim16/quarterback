import React, { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import type { Country, ISO2 } from '../../types'

const CountriesSettings = () => {
  const { settings, countries, addCountry, updateCountry, removeCountry } = useAppStore()
  const [newCountry, setNewCountry] = useState<Country>({ code: '', name: '' })
  const [editingCountry, setEditingCountry] = useState<ISO2 | null>(null)

  const handleAddCountry = () => {
    if (newCountry.code && newCountry.name) {
      const code = newCountry.code.toUpperCase() as ISO2
      if (code.length === 2 && !countries.some(c => c.code === code)) {
        addCountry({ code, name: newCountry.name })
        setNewCountry({ code: '', name: '' })
      }
    }
  }

  const handleUpdateCountry = (code: ISO2, name: string) => {
    updateCountry(code, name)
    setEditingCountry(null)
  }

  const handleRemoveCountry = (code: ISO2) => {
    removeCountry(code)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCountry()
    }
  }

  const isValidCountryCode = (code: string) => {
    return code.length === 2 && /^[A-Z]{2}$/.test(code.toUpperCase())
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Country Management</h2>
        <p className="text-gray-600 mt-1">Manage the list of countries for holiday and team member locations.</p>
      </div>

      {/* Add New Country */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Country</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country Code (ISO-2)
            </label>
            <input
              type="text"
              value={newCountry.code}
              onChange={(e) => setNewCountry(prev => ({ 
                ...prev, 
                code: e.target.value.toUpperCase().slice(0, 2) 
              }))}
              onKeyPress={handleKeyPress}
              placeholder="e.g., NL, DE, US"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {newCountry.code && !isValidCountryCode(newCountry.code) && (
              <p className="text-xs text-red-600 mt-1">Must be exactly 2 letters</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country Name
            </label>
            <input
              type="text"
              value={newCountry.name}
              onChange={(e) => setNewCountry(prev => ({ ...prev, name: e.target.value }))}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Netherlands, Germany, United States"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleAddCountry}
              disabled={!newCountry.code || !newCountry.name || !isValidCountryCode(newCountry.code)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Country
            </button>
          </div>
        </div>
      </div>

      {/* Countries List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Available Countries</h3>
        
        {countries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🌍</div>
            <p>No countries added yet</p>
            <p className="text-sm">Add countries to enable location-based features</p>
          </div>
        ) : (
          <div className="space-y-3">
            {countries.map((country) => (
              <div key={country.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                {editingCountry === country.code ? (
                  <div className="flex-1 flex items-center space-x-3">
                    <div className="w-16 px-2 py-1 bg-gray-200 rounded text-sm font-mono text-center">
                      {country.code}
                    </div>
                    <input
                      type="text"
                      defaultValue={country.name}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateCountry(country.code, e.currentTarget.value)
                        }
                      }}
                      onBlur={(e) => handleUpdateCountry(country.code, e.target.value)}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => setEditingCountry(null)}
                      className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 flex items-center space-x-3">
                      <div className="w-16 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-mono text-center">
                        {country.code}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{country.name}</div>
                        <div className="text-sm text-gray-500">ISO-2 Code</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingCountry(country.code)}
                        className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveCountry(country.code)}
                        className="px-2 py-1 text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">How Countries Are Used</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Holidays:</strong> Assign holidays to specific countries or make them global</li>
          <li>• <strong>Team Members:</strong> Set location for capacity calculations</li>
          <li>• <strong>Capacity:</strong> Calculate working days excluding country-specific holidays</li>
        </ul>
      </div>
    </div>
  )
}

export default CountriesSettings



