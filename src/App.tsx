import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import QuarterSelector from './components/QuarterSelector'
import PlanPage from './pages/PlanPage'
import TeamPage from './pages/TeamPage'
import HolidaysPage from './pages/HolidaysPage'
import SettingsPage from './pages/SettingsPage'
import { useAppStore } from './store/useAppStore'
import { getMainPageFromHash } from './utils/routing'
import type { Selection } from './types'

function App() {
  return (
    <Layout>
      <AppContent />
    </Layout>
  )
}

function AppContent() {
  const { selection, setSelection } = useAppStore()

  useEffect(() => {
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
  }, [setSelection])

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
