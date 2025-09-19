// Persistence utilities for localStorage with versioning
/* eslint-disable no-console */
const STORAGE_VERSION = '2.1.0'

interface StoredData<T> {
  version: string
  data: T
  timestamp: number
}

export function save<T>(key: string, data: T): void {
  try {
    const storedData: StoredData<T> = {
      version: STORAGE_VERSION,
      data,
      timestamp: Date.now(),
    }
    localStorage.setItem(key, JSON.stringify(storedData))
  } catch (error) {
    console.warn(`Failed to save data for key "${key}":`, error)
  }
}

export function load<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return fallback

    const parsed: StoredData<T> = JSON.parse(stored)

    // Check version compatibility
    if (parsed.version !== STORAGE_VERSION) {
      console.warn(
        `Version mismatch for key "${key}". Expected: ${STORAGE_VERSION}, Got: ${parsed.version}`,
      )
      // Migrate data if possible
      return migrateData(parsed.data, parsed.version)
    }

    return parsed.data
  } catch (error) {
    console.warn(`Failed to load data for key "${key}":`, error)
    return fallback
  }
}

// Migration function for data structure changes
function migrateData<T>(data: any, fromVersion: string): T {
  console.log(`Migrating data from version ${fromVersion} to ${STORAGE_VERSION}`)

  // Migration from v2.0.0 to v2.1.0 (add multi-quarter support)
  if (fromVersion === '2.0.0' && data) {
    // Convert single quarter to quarters array
    if (data.quarter && !data.quarters) {
      data.quarters = [{
        id: 'q4-2025',
        name: 'Q4 2025',
        description: 'Fourth Quarter 2025',
        startISO: data.quarter.startISO,
        endISO: data.quarter.endISO,
      }]
      data.currentQuarterId = 'q4-2025'
      delete data.quarter
    }
  }

  // Migration from v1.0.0 to v2.0.0
  if (fromVersion === '1.0.0' && data) {
    // Migrate holidays from location to countries
    if (data.holidays && Array.isArray(data.holidays)) {
      data.holidays = data.holidays.map((holiday: any) => {
        if (holiday.location !== undefined) {
          const countries: string[] = []
          if (holiday.location && typeof holiday.location === 'string') {
            const location = holiday.location.toUpperCase()
            if (/^[A-Z]{2}$/.test(location)) {
              countries.push(location)
            }
          }
          delete holiday.location
          return { ...holiday, countries }
        }
        return holiday
      })
    }

    // Migrate team members from location to country
    if (data.team && Array.isArray(data.team)) {
      data.team = data.team.map((member: any) => {
        if (member.location !== undefined) {
          const location = member.location?.toUpperCase()
          const country = location && /^[A-Z]{2}$/.test(location) ? location : undefined
          delete member.location
          return { ...member, country }
        }
        return member
      })
    }

    // Add countries to settings if not present
    if (data.settings && !data.settings.countries) {
      data.settings.countries = [
        { code: 'CZ', name: 'Czechia' },
        { code: 'DE', name: 'Germany' },
        { code: 'ES', name: 'Spain' },
        { code: 'FI', name: 'Finland' },
        { code: 'FR', name: 'France' },
        { code: 'IT', name: 'Italy' },
        { code: 'NL', name: 'Netherlands' },
        { code: 'PT', name: 'Portugal' },
        { code: 'SE', name: 'Sweden' },
        { code: 'SK', name: 'Slovakia' },
        { code: 'UK', name: 'United Kingdom' },
      ]
    }
  }

  return data
}

export function clear(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn(`Failed to clear data for key "${key}":`, error)
  }
}

export function has(key: string): boolean {
  try {
    return localStorage.getItem(key) !== null
  } catch (error) {
    console.warn(`Failed to check existence for key "${key}":`, error)
    return false
  }
}
