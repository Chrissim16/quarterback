// Routing utilities for handling URL hash navigation

export type MainPage = 'plan' | 'team' | 'settings'
export type SettingsSection = 'general' | 'quarters' | 'countries' | 'holidays' | 'jira'

/**
 * Extract the main page from a URL hash
 * Examples:
 * - '#plan' -> 'plan'
 * - '#settings-quarters' -> 'settings'
 * - '#team' -> 'team'
 */
export function getMainPageFromHash(hash: string): MainPage {
  const cleanHash = hash.replace('#', '') || 'plan'
  const mainPage = cleanHash.split('-')[0] as MainPage
  
  // Validate that it's a known main page
  const validPages: MainPage[] = ['plan', 'team', 'settings']
  return validPages.includes(mainPage) ? mainPage : 'plan'
}

/**
 * Extract the settings section from a URL hash
 * Examples:
 * - '#settings-general' -> 'general'
 * - '#settings-quarters' -> 'quarters'
 * - '#settings' -> 'general' (default)
 */
export function getSettingsSectionFromHash(hash: string): SettingsSection {
  if (!hash.startsWith('#settings')) {
    return 'general'
  }
  
  const section = hash.replace('#settings-', '') as SettingsSection
  const validSections: SettingsSection[] = ['general', 'quarters', 'countries', 'holidays', 'jira']
  return validSections.includes(section) ? section : 'general'
}

/**
 * Create a URL hash for a main page
 */
export function createMainPageHash(page: MainPage): string {
  return `#${page}`
}

/**
 * Create a URL hash for a settings section
 */
export function createSettingsSectionHash(section: SettingsSection): string {
  return `#settings-${section}`
}

