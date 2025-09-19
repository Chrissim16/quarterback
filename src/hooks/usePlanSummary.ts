import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'

export interface ApplicationSummary {
  application: string
  totalAdjustedDays: number
  itemCount: number
}

export interface PlanSummary {
  totalAdjustedEffort: number
  totalItems: number
  byApplication: ApplicationSummary[]
}

/**
 * Hook to calculate plan summary statistics
 */
export const usePlanSummary = (): PlanSummary => {
  const { items } = useAppStore()

  return useMemo(() => {
    // Calculate total adjusted effort
    const totalAdjustedEffort = items.reduce((sum, item) => {
      return sum + (item.adjustedDays || 0)
    }, 0)

    // Group by application
    const applicationMap = new Map<string, { totalAdjustedDays: number; itemCount: number }>()
    
    items.forEach(item => {
      const application = item.application || 'Unassigned'
      const current = applicationMap.get(application) || { totalAdjustedDays: 0, itemCount: 0 }
      
      applicationMap.set(application, {
        totalAdjustedDays: current.totalAdjustedDays + (item.adjustedDays || 0),
        itemCount: current.itemCount + 1,
      })
    })

    // Convert to array and sort by total adjusted days (descending)
    const byApplication: ApplicationSummary[] = Array.from(applicationMap.entries())
      .map(([application, data]) => ({
        application,
        totalAdjustedDays: Math.round(data.totalAdjustedDays * 100) / 100, // Round to 2 decimal places
        itemCount: data.itemCount,
      }))
      .sort((a, b) => b.totalAdjustedDays - a.totalAdjustedDays)

    return {
      totalAdjustedEffort: Math.round(totalAdjustedEffort * 100) / 100, // Round to 2 decimal places
      totalItems: items.length,
      byApplication,
    }
  }, [items])
}


