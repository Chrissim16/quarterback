/**
 * Application matching utilities for strict assignment rules
 */

export const normApp = (v?: string): string => (v ?? '').trim().toLowerCase()

export const appsMatch = (a?: string, b?: string): boolean => normApp(a) === normApp(b)

export const hasValidApplication = (app?: string): boolean => {
  const normalized = normApp(app)
  return normalized.length > 0
}

