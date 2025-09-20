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
    <div className="min-h-screen">
      {/* Top Bar */}
      <div className="glass border-b border-white/20 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <h1 className="text-3xl font-bold text-gradient">Quarterback</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Quarter Switcher */}
            <div className="relative" data-quarter-switcher>
              <button
                onClick={() => setShowQuarterSwitcher(!showQuarterSwitcher)}
                className="btn-secondary flex items-center space-x-2 px-4 py-2 text-sm font-medium"
              >
                <span className="font-medium">
                  {currentQuarter ? currentQuarter.name : 'Select Quarter'}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showQuarterSwitcher && (
                <div className="absolute right-0 mt-2 w-64 card z-50 animate-float">
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-1">Switch Quarter</div>
                    {quarters.map((quarter) => (
                      <button
                        key={quarter.id}
                        onClick={() => handleQuarterSwitch(quarter.id)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                          quarter.id === currentQuarter?.id 
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200' 
                            : 'text-gray-700 hover:bg-gray-50 hover:scale-[1.02]'
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
        <div className="w-64 glass border-r border-white/20 min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={() => handleNavigation(item.key)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between group ${
                      selection === item.key
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform -translate-y-0.5'
                        : 'text-gray-600 hover:bg-white/50 hover:text-gray-900 hover:scale-[1.02]'
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
                    <ul className="ml-4 mt-2 space-y-1">
                      {settingsSubpages.map((subpage) => (
                        <li key={subpage.key}>
                          <button
                            onClick={() => handleSettingsSubpage(subpage.key)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                              activeSettingsSection === subpage.key
                                ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-200 shadow-sm'
                                : 'text-gray-500 hover:bg-white/30 hover:text-gray-700 hover:scale-[1.02]'
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
            <div className="animate-fadeIn">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layout
