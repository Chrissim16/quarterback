import { useState, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import { JiraClient, jiraIssueToPlanItem, planItemToJiraIssue, buildJQLForProject } from '../lib/jira'
import type { JiraConfig, JiraIssue } from '../lib/jira'
import type { PlanItem } from '../types'

export const useJira = () => {
  const { settings, items, addPlanItem, updatePlanItem } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [client, setClient] = useState<JiraClient | null>(null)

  const connect = useCallback(async (config: JiraConfig) => {
    setIsLoading(true)
    setError(null)

    try {
      const jiraClient = new JiraClient(config)
      const isConnected = await jiraClient.testConnection()
      
      if (isConnected) {
        setClient(jiraClient)
        // Update settings with Jira config
        useAppStore.getState().updateSettings({
          jira: {
            baseUrl: config.baseUrl,
            username: config.username,
            projectKey: config.projectKey,
            isConnected: true,
            lastSync: new Date().toISOString(),
          }
        })
        return true
      } else {
        setError('Failed to connect to Jira. Please check your credentials.')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setClient(null)
    setError(null)
    useAppStore.getState().updateSettings({
      jira: undefined
    })
  }, [])

  const syncFromJira = useCallback(async (jql?: string) => {
    if (!client || !settings.jira) {
      setError('Not connected to Jira')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const query = jql || buildJQLForProject(settings.jira.projectKey)
      const result = await client.searchIssues(query, 0, 100)
      
      // Convert Jira issues to plan items
      const newItems: PlanItem[] = []
      const existingItems = new Map(items.map(item => [item.jiraKey, item]))

      for (const issue of result.issues) {
        const existingItem = existingItems.get(issue.key)
        
        if (existingItem) {
          // Update existing item with latest Jira data
          const updatedItem = jiraIssueToPlanItem(issue)
          updatePlanItem({
            id: existingItem.id,
            ...updatedItem,
            // Preserve Quarterback-specific fields
            application: existingItem.application,
            certainty: existingItem.certainty,
            adjustedDays: existingItem.adjustedDays,
          })
        } else {
          // Create new item
          const newItem = jiraIssueToPlanItem(issue)
          addPlanItem(newItem)
          newItems.push(newItem)
        }
      }

      // Update last sync time
      useAppStore.getState().updateSettings({
        jira: {
          ...settings.jira,
          lastSync: new Date().toISOString(),
        }
      })

      return {
        total: result.total,
        newItems: newItems.length,
        updatedItems: result.issues.length - newItems.length,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync from Jira'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [client, settings.jira, items, addPlanItem, updatePlanItem])

  const syncToJira = useCallback(async (planItems?: PlanItem[]) => {
    if (!client || !settings.jira) {
      setError('Not connected to Jira')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const itemsToSync = planItems || items.filter(item => item.jiraKey)
      const results = {
        created: 0,
        updated: 0,
        errors: 0,
      }

      for (const item of itemsToSync) {
        try {
          if (item.jiraKey) {
            // Update existing Jira issue
            const jiraData = planItemToJiraIssue(item)
            await client.updateIssue(item.jiraKey, jiraData)
            results.updated++
          } else {
            // Create new Jira issue
            const jiraData = planItemToJiraIssue(item)
            const result = await client.createIssue({
              summary: item.title,
              description: item.notes,
              issuetype: item.type,
              labels: item.label ? item.label.split(', ').filter(Boolean) : [],
              customfield_10016: item.baseDays,
            })
            
            // Update the plan item with Jira info
            updatePlanItem({
              id: item.id,
              jiraId: result.id,
              jiraKey: result.key,
            })
            results.created++
          }
        } catch (err) {
          console.error(`Failed to sync item ${item.id}:`, err)
          results.errors++
        }
      }

      // Update last sync time
      useAppStore.getState().updateSettings({
        jira: {
          ...settings.jira,
          lastSync: new Date().toISOString(),
        }
      })

      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync to Jira'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [client, settings.jira, items, updatePlanItem])

  const getJiraStatus = useCallback(() => {
    if (!settings.jira) {
      return { connected: false, message: 'Not configured' }
    }
    
    if (!settings.jira.isConnected) {
      return { connected: false, message: 'Disconnected' }
    }
    
    return { 
      connected: true, 
      message: `Connected to ${settings.jira.projectKey}`,
      lastSync: settings.jira.lastSync
    }
  }, [settings.jira])

  return {
    // State
    isLoading,
    error,
    client,
    isConnected: !!client,
    
    // Actions
    connect,
    disconnect,
    syncFromJira,
    syncToJira,
    getJiraStatus,
    
    // Utils
    clearError: () => setError(null),
  }
}


