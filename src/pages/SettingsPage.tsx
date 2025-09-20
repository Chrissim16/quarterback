import { useState, useEffect } from 'react'
import GeneralSettings from '../components/settings/GeneralSettings'
import QuartersSettings from '../components/settings/QuartersSettings'
import CountriesSettings from '../components/settings/CountriesSettings'
import JiraSettings from '../components/settings/JiraSettings'
import DatabaseSettings from '../components/settings/DatabaseSettings'
import HolidaysPage from './HolidaysPage'
import { getSettingsSectionFromHash } from '../utils/routing'

type SettingsSection = 'general' | 'quarters' | 'countries' | 'holidays' | 'jira' | 'database'

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general')

  useEffect(() => {
    // Get initial section from hash
    const section = getSettingsSectionFromHash(window.location.hash)
    setActiveSection(section)

    // Listen for hash changes
    const handleHashChange = () => {
      const section = getSettingsSectionFromHash(window.location.hash)
      setActiveSection(section)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralSettings />
      case 'quarters':
        return <QuartersSettings />
      case 'countries':
        return <CountriesSettings />
      case 'holidays':
        return <HolidaysPage />
      case 'jira':
        return <JiraSettings />
      case 'database':
        return <DatabaseSettings />
      default:
        return <GeneralSettings />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your application settings and configuration.
        </p>
      </div>
      {renderSection()}
    </div>
  )
}

export default SettingsPage