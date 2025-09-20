import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import QuarterSelector from './components/QuarterSelector'
import MigrationNotification from './components/MigrationNotification'
import PlanPage from './pages/PlanPage'
import TeamPage from './pages/TeamPage'
import HolidaysPage from './pages/HolidaysPage'
import SettingsPage from './pages/SettingsPage'
import { useAppStore } from './store/useAppStore'
import { getMainPageFromHash } from './utils/routing'
import type { Selection } from './types'

function App() {
  const [showMigrationNotification, setShowMigrationNotification] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Layout>
        <AppContent />
      </Layout>
      {showMigrationNotification && (
        <MigrationNotification onDismiss={() => setShowMigrationNotification(false)} />
      )}
    </div>
  )
}

function AppContent() {
  const { selection, setSelection, currentQuarterId } = useAppStore()

  useEffect(() => {
    if (currentQuarterId) {
      // Get initial page from hash
      const mainPage = getMainPageFromHash(window.location.hash)
      setSelection(mainPage)

      // Listen for hash changes
      const handleHashChange = () => {
        const mainPage = getMainPageFromHash(window.location.hash)
        setSelection(mainPage)
      }

      window.addEventListener('hashchange', handleHashChange)
      return () => window.removeEventListener('hashchange', handleHashChange)
    }
  }, [setSelection, currentQuarterId])

  if (!currentQuarterId) {
    console.log('Showing quarter selector - currentQuarterId:', currentQuarterId)
    return <QuarterSelector onQuarterSelected={() => {}} />
  }

  const renderPage = () => {
    switch (selection) {
      case 'plan':
        return <PlanPage />
      case 'team':
        return <TeamPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <PlanPage />
    }
  }

  return renderPage()
}

export default App
