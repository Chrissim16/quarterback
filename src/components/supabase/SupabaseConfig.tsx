import React, { useState, useEffect } from 'react'
import { supabaseService } from '../../lib/supabaseService'

interface SupabaseConfigProps {
  onConfigured: (email: string) => void
}

const SupabaseConfig: React.FC<SupabaseConfigProps> = ({ onConfigured }) => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    // Check if we have stored email
    const storedEmail = localStorage.getItem('quarterback-user-email')
    if (storedEmail) {
      setEmail(storedEmail)
      setIsConfigured(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      await supabaseService.initializeUser(email.trim())
      localStorage.setItem('quarterback-user-email', email.trim())
      setIsConfigured(true)
      onConfigured(email.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to configure Supabase')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    localStorage.removeItem('quarterback-user-email')
    setIsConfigured(false)
    setEmail('')
  }

  if (isConfigured) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div>
              <div className="text-sm font-medium text-green-800">
                Connected to Supabase
              </div>
              <div className="text-xs text-green-600">
                User: {email}
              </div>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="text-xs text-green-600 hover:text-green-800 underline"
          >
            Disconnect
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start space-x-3">
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
          🗄️
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Database Setup Required
          </h3>
          <p className="text-sm text-blue-700 mb-4">
            To sync your data across devices and browsers, please enter your email address. 
            This will create a secure user account in Supabase.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-900 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Setting up...' : 'Connect to Database'}
            </button>
          </form>
          
          <div className="mt-4 text-xs text-blue-600">
            <strong>Note:</strong> Your data will be stored securely in Supabase and synced across all your devices.
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupabaseConfig

