/**
 * Date utility functions for working days calculation
 */

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay()
  return day === 0 || day === 6 // Sunday = 0, Saturday = 6
}

/**
 * Check if a date is a weekday (Monday to Friday)
 */
export const isWeekday = (date: Date): boolean => {
  return !isWeekend(date)
}

/**
 * Get the date range between two ISO date strings
 */
export const dateRange = (startISO: string, endISO: string): Date[] => {
  const start = new Date(startISO)
  const end = new Date(endISO)
  const dates: Date[] = []
  
  // Ensure start is before or equal to end
  if (start > end) {
    return []
  }
  
  const current = new Date(start)
  while (current <= end) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  
  return dates
}

/**
 * Calculate the number of working days (Monday to Friday) between two dates
 * @param startISO Start date in ISO format (YYYY-MM-DD)
 * @param endISO End date in ISO format (YYYY-MM-DD)
 * @returns Number of working days between the dates (inclusive)
 */
export const workingDaysBetween = (startISO: string, endISO: string): number => {
  const dates = dateRange(startISO, endISO)
  return dates.filter(isWeekday).length
}

/**
 * Format a date for display
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

/**
 * Format a date range for display
 */
export const formatDateRange = (startISO: string, endISO: string): string => {
  const start = new Date(startISO)
  const end = new Date(endISO)
  
  const startFormatted = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
  
  const endFormatted = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
  
  return `${startFormatted} - ${endFormatted}`
}

/**
 * Validate that start date is before or equal to end date
 */
export const validateDateRange = (startISO: string, endISO: string): { isValid: boolean; error?: string } => {
  const start = new Date(startISO)
  const end = new Date(endISO)
  
  if (isNaN(start.getTime())) {
    return { isValid: false, error: 'Invalid start date' }
  }
  
  if (isNaN(end.getTime())) {
    return { isValid: false, error: 'Invalid end date' }
  }
  
  if (start > end) {
    return { isValid: false, error: 'Start date must be before or equal to end date' }
  }
  
  return { isValid: true }
}


