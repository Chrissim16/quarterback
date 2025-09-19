import { useState, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { formatDateRange, workingDaysBetween } from '../lib/dates'
import { getMainPageFromHash, getSettingsSectionFromHash } from '../utils/routing'
import type { LayoutProps, Selection } from '../types'

type SettingsSection = 'general' | 'quarters' | 'countries' | 'holidays' | 'jira'

const Layout = ({ children }: LayoutProps) => {
  const { selection, setSelection, getCurrentQuarter, quarters, setCurrentQuarter } = useAppStore()
  const currentQuarter = getCurrentQuarter()
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false)
  const [activeSettingsSection, setActiveSettingsSection] = useState<SettingsSection>('general')
  const [showQuarterSwitcher, setShowQuarterSwitcher] = useState(false)

  const navigationItems: { key: Selection; label: string; hasSubpages?: boolean }[] = [
    { key: 'plan', label: 'Plan' },
    { key: 'team', label: 'Team' },
    { key: 'settings', label: 'Settings', hasSubpages: true },
  ]

  const settingsSubpages: { key: SettingsSection; label: string }[] = [
    { key: 'general', label: 'General' },
    { key: 'quarters', label: 'Quarters' },
    { key: 'countries', label: 'Countries' },
    { key: 'holidays', label: 'Holidays' },
    { key: 'jira', label: 'Jira Integration' },
  ]

  // Handle URL hash changes for settings subpages
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      const mainPage = getMainPageFromHash(hash)
      
      if (mainPage === 'settings') {
        const section = getSettingsSectionFromHash(hash)
        setActiveSettingsSection(section)
        setIsSettingsExpanded(true)
      } else {
        setIsSettingsExpanded(false)
      }
    }

    // Check initial hash
    handleHashChange()

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Handle click outside to close quarter switcher
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showQuarterSwitcher) {
        const target = event.target as Element
        if (!target.closest('[data-quarter-switcher]')) {
          setShowQuarterSwitcher(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showQuarterSwitcher])

  const handleNavigation = (key: Selection) => {
    setSelection(key)
    window.location.hash = key
    
    if (key === 'settings') {
      setIsSettingsExpanded(!isSettingsExpanded)
      // If collapsing, go to general settings
      if (isSettingsExpanded) {
        window.location.hash = '#settings-general'
      }
    } else {
      setIsSettingsExpanded(false)
    }
  }

  const handleSettingsSubpage = (section: SettingsSection) => {
    setActiveSettingsSection(section)
    window.location.hash = `#settings-${section}`
  }

  const handleQuarterSwitch = (quarterId: string) => {
    setCurrentQuarter(quarterId)
    setShowQuarterSwitcher(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Quarterback</h1>
          <div className="flex items-center space-x-4">
            {/* Quarter Switcher */}
            <div className="relative" data-quarter-switcher>
              <button
                onClick={() => setShowQuarterSwitcher(!showQuarterSwitcher)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <span className="font-medium">
                  {currentQuarter ? currentQuarter.name : 'Select Quarter'}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showQuarterSwitcher && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-1">Switch Quarter</div>
                    {quarters.map((quarter) => (
                      <button
                        key={quarter.id}
                        onClick={() => handleQuarterSwitch(quarter.id)}
                        className={`w-full text-left px-2 py-2 text-sm rounded hover:bg-gray-50 transition-colors ${
                          quarter.id === currentQuarter?.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <div className="font-medium">{quarter.name}</div>
                        <div className="text-xs text-gray-500">
                          {formatDateRange(quarter.startISO, quarter.endISO)} • {workingDaysBetween(quarter.startISO, quarter.endISO)} days
                        </div>
                        {quarter.label && (
                          <div className="text-xs text-blue-600 mt-1">Label: {quarter.label}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Quarter Info */}
            <div className="text-sm text-gray-500">
              {currentQuarter ? (
                <>
                  <div className="text-xs text-gray-400">
                    {formatDateRange(currentQuarter.startISO, currentQuarter.endISO)} • {workingDaysBetween(currentQuarter.startISO, currentQuarter.endISO)} working days
                  </div>
                </>
              ) : (
                <div>No quarter selected</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4">
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={() => handleNavigation(item.key)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-between ${
                      selection === item.key
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.hasSubpages && (
                      <span className={`text-xs transition-transform ${
                        isSettingsExpanded ? 'rotate-90' : ''
                      }`}>
                        ▶
                      </span>
                    )}
                  </button>
                  
                  {/* Settings Subpages */}
                  {item.key === 'settings' && isSettingsExpanded && (
                    <ul className="ml-4 mt-1 space-y-1">
                      {settingsSubpages.map((subpage) => (
                        <li key={subpage.key}>
                          <button
                            onClick={() => handleSettingsSubpage(subpage.key)}
                            className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                              activeSettingsSection === subpage.key
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                          >
                            {subpage.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layout
