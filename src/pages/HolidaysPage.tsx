import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import type { Holiday, ISO2 } from '../types'

const HolidaysPage = () => {
  const { getCurrentQuarterHolidays, getCurrentQuarter, settings, countries, addHoliday, updateHoliday, removeHoliday } = useAppStore()
  const holidays = getCurrentQuarterHolidays()
  const quarter = getCurrentQuarter()
  const [isAddingHoliday, setIsAddingHoliday] = useState(false)
  const [newHoliday, setNewHoliday] = useState<Partial<Holiday>>({
    dateISO: '',
    name: '',
    countryCodes: [],
  })
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)

  const handleAddHoliday = () => {
    if (newHoliday.dateISO && newHoliday.name?.trim()) {
      addHoliday({
        dateISO: newHoliday.dateISO,
        name: newHoliday.name.trim(),
        countryCodes: newHoliday.countryCodes || [],
      })
      setNewHoliday({
        dateISO: '',
        name: '',
        countryCodes: [],
      })
      setIsAddingHoliday(false)
    }
  }

  const handleFieldChange = (id: string, field: keyof Holiday, value: any) => {
    updateHoliday(id, { [field]: value })
  }

  const handleDeleteHoliday = (id: string) => {
    if (confirm('Are you sure you want to delete this holiday?')) {
      removeHoliday(id)
    }
  }

  const toggleCountry = (countryCode: ISO2) => {
    const currentCountries = newHoliday.countryCodes || []
    const updatedCountries = currentCountries.includes(countryCode)
      ? currentCountries.filter(code => code !== countryCode)
      : [...currentCountries, countryCode]
    setNewHoliday({ ...newHoliday, countryCodes: updatedCountries })
  }

  const isDateInQuarter = (dateISO: string) => {
    if (!quarter) return false
    const date = new Date(dateISO)
    const quarterStart = new Date(quarter.startISO)
    const quarterEnd = new Date(quarter.endISO)
    return date >= quarterStart && date <= quarterEnd
  }

  const getQuarterDateRange = () => {
    if (!quarter) return { start: '', end: '' }
    const start = new Date(quarter.startISO)
    const end = new Date(quarter.endISO)
    return {
      start: start.toLocaleDateString('en-GB'),
      end: end.toLocaleDateString('en-GB'),
    }
  }

  const sortedHolidays = [...holidays].sort((a, b) => 
    new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
  )

  const formatCountryDisplay = (code: ISO2) => {
    const country = countries.find(c => c.code === code)
    return country ? `${country.code} — ${country.name}` : code
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Holidays</h2>
            <p className="text-gray-600 mt-1">
              Manage public holidays for the quarter ({getQuarterDateRange().start} - {getQuarterDateRange().end}).
            </p>
          </div>
          <button
            onClick={() => setIsAddingHoliday(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Holiday
          </button>
        </div>
      </div>

      {/* Add Holiday Form */}
      {isAddingHoliday && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Holiday</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={newHoliday.dateISO || ''}
                onChange={(e) => setNewHoliday({ ...newHoliday, dateISO: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {newHoliday.dateISO && !isDateInQuarter(newHoliday.dateISO) && (
                <p className="text-sm text-yellow-600 mt-1">
                  ⚠️ Date is outside the current quarter
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Holiday Name *
              </label>
              <input
                type="text"
                value={newHoliday.name || ''}
                onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                placeholder="Christmas Day"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Countries Selection */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Countries (leave empty for global holiday)
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                className="w-full px-3 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {newHoliday.countryCodes?.length === 0 
                  ? 'Global holiday (all countries)'
                  : `${newHoliday.countryCodes?.length} countries selected`
                }
              </button>
              
              {isCountryDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {countries.map((country) => (
                    <label
                      key={country.code}
                      className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newHoliday.countryCodes?.includes(country.code) || false}
                        onChange={() => toggleCountry(country.code)}
                        className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900">
                        {country.code} — {country.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Countries Display */}
            {newHoliday.countryCodes && newHoliday.countryCodes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {newHoliday.countryCodes.map((countryCode) => (
                  <span
                    key={countryCode}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {formatCountryDisplay(countryCode)}
                    <button
                      onClick={() => toggleCountry(countryCode)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setIsAddingHoliday(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddHoliday}
              disabled={!newHoliday.dateISO || !newHoliday.name?.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Holiday
            </button>
          </div>
        </div>
      )}

      {/* Holidays List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Holidays</h3>
        </div>

        {sortedHolidays.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No holidays added yet</h3>
            <p className="text-gray-500 mb-4">Add holidays to track public holidays for your team.</p>
            <button
              onClick={() => setIsAddingHoliday(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Holiday
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedHolidays.map((holiday) => (
              <div key={holiday.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <input
                            type="text"
                            value={holiday.name}
                            onChange={(e) => handleFieldChange(holiday.id, 'name', e.target.value)}
                            className="text-lg font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                          />
                          <span className="text-sm text-gray-500">
                            {new Date(holiday.dateISO).toLocaleDateString('en-GB')}
                          </span>
                          {!isDateInQuarter(holiday.dateISO) && (
                            <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                              Outside Quarter
                            </span>
                          )}
                        </div>
                        <div className="mt-2">
                          {holiday.countryCodes.length === 0 ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Global Holiday
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {holiday.countryCodes.map((countryCode) => (
                                <span
                                  key={countryCode}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {formatCountryDisplay(countryCode)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={holiday.dateISO}
                      onChange={(e) => handleFieldChange(holiday.id, 'dateISO', e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleDeleteHoliday(holiday.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HolidaysPage