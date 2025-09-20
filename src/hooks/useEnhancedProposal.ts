import { useState, useMemo, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useCapacity } from './useCapacity'
import { generateEnhancedProposals, calculateAssignmentMetrics } from '../lib/enhancedProposalEngine'
import type { 
  AssignmentStrategy, 
  AssignmentMetrics, 
  ManualOverride, 
  AssignmentHistory,
  ProposalItem 
} from '../types'

/**
 * Hook to manage enhanced assignment proposals with advanced algorithms
 */
export const useEnhancedProposal = () => {
  const { items, team, proposal, setProposal, clearProposal } = useAppStore()
  const capacity = useCapacity()
  const [isGenerating, setIsGenerating] = useState(false)
  const [strategy, setStrategy] = useState<AssignmentStrategy>(getDefaultStrategy())
  const [manualOverrides, setManualOverrides] = useState<ManualOverride[]>([])
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistory[]>([])

  // Create member capacities map
  const memberCapacities = useMemo(() => {
    const map = new Map<string, number>()
    capacity.perMember.forEach(member => {
      map.set(member.memberId, member.capacityDays)
    })
    return map
  }, [capacity.perMember])

  // Generate enhanced proposals
  const generateProposals = useCallback(async () => {
    setIsGenerating(true)
    
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const newProposals = generateEnhancedProposals(
        items, 
        team, 
        memberCapacities, 
        strategy, 
        manualOverrides, 
        assignmentHistory
      )
      
      setProposal({
        generatedAtISO: new Date().toISOString(),
        items: newProposals,
      })
    } catch (error) {
      console.error('Error generating enhanced proposals:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [items, team, memberCapacities, strategy, manualOverrides, assignmentHistory, setProposal])

  // Clear proposals
  const clearProposals = useCallback(() => {
    clearProposal()
  }, [clearProposal])

  // Add manual override
  const addManualOverride = useCallback((override: Omit<ManualOverride, 'id' | 'createdAt' | 'isActive'>) => {
    const newOverride: ManualOverride = {
      ...override,
      id: `override_${Date.now()}`,
      createdAt: new Date().toISOString(),
      isActive: true,
    }
    setManualOverrides(prev => [...prev, newOverride])
  }, [])

  // Remove manual override
  const removeManualOverride = useCallback((overrideId: string) => {
    setManualOverrides(prev => prev.filter(override => override.id !== overrideId))
  }, [])

  // Update assignment strategy
  const updateStrategy = useCallback((newStrategy: Partial<AssignmentStrategy>) => {
    setStrategy(prev => ({ ...prev, ...newStrategy }))
  }, [])

  // Get proposals from store
  const proposals = proposal?.items || []

  // Check if we have any proposals
  const hasProposals = proposals.length > 0

  // Check if any proposals are not fully assigned
  const hasUnassignedItems = proposals.some(proposal => proposal.status !== 'fully-assigned')

  // Calculate total assigned days
  const totalAssignedDays = proposals.reduce((sum, proposal) => {
    return sum + proposal.allocations.reduce((allocSum, alloc) => allocSum + alloc.daysAssigned, 0)
  }, 0)

  // Calculate total adjusted days
  const totalAdjustedDays = proposals.reduce((sum, proposal) => sum + proposal.adjustedDays, 0)

  // Calculate total unassigned days
  const totalUnassignedDays = proposals.reduce((sum, proposal) => sum + (proposal.unassignedDays || 0), 0)

  // Calculate assignment efficiency
  const assignmentEfficiency = totalAdjustedDays > 0 ? (totalAssignedDays / totalAdjustedDays) * 100 : 100

  // Calculate enhanced metrics
  const metrics = useMemo(() => {
    if (proposals.length === 0) return null
    return calculateAssignmentMetrics(items, team, memberCapacities, proposals)
  }, [items, team, memberCapacities, proposals])

  // Get strategy options
  const strategyOptions = useMemo(() => [
    {
      name: 'Skill-Based',
      description: 'Prioritizes skill matching over other factors',
      algorithm: 'skill-based' as const,
      weights: { skillMatch: 0.7, workloadBalance: 0.2, priority: 0.1, deadline: 0.0, preferences: 0.0 }
    },
    {
      name: 'Workload Balanced',
      description: 'Focuses on even workload distribution',
      algorithm: 'workload-balanced' as const,
      weights: { skillMatch: 0.3, workloadBalance: 0.6, priority: 0.1, deadline: 0.0, preferences: 0.0 }
    },
    {
      name: 'Priority-Based',
      description: 'Assigns based on item priority and deadlines',
      algorithm: 'priority-based' as const,
      weights: { skillMatch: 0.2, workloadBalance: 0.2, priority: 0.4, deadline: 0.2, preferences: 0.0 }
    },
    {
      name: 'Hybrid',
      description: 'Balances all factors for optimal assignments',
      algorithm: 'hybrid' as const,
      weights: { skillMatch: 0.4, workloadBalance: 0.3, priority: 0.2, deadline: 0.1, preferences: 0.0 }
    }
  ], [])

  return {
    // Basic proposal data
    proposals,
    isGenerating,
    hasProposals,
    hasUnassignedItems,
    totalAssignedDays,
    totalAdjustedDays,
    totalUnassignedDays,
    assignmentEfficiency,
    
    // Enhanced features
    strategy,
    manualOverrides,
    assignmentHistory,
    metrics,
    strategyOptions,
    
    // Actions
    generateProposals,
    clearProposals,
    addManualOverride,
    removeManualOverride,
    updateStrategy,
  }
}

/**
 * Get default assignment strategy
 */
function getDefaultStrategy(): AssignmentStrategy {
  return {
    name: 'Hybrid Assignment',
    description: 'Balances skill matching, workload distribution, and team preferences',
    algorithm: 'hybrid',
    weights: {
      skillMatch: 0.4,
      workloadBalance: 0.3,
      priority: 0.2,
      deadline: 0.1,
      preferences: 0.0
    },
    settings: {
      allowPartialAssignments: true,
      maxConcurrentItems: 3,
      considerDependencies: true,
      respectDeadlines: true
    }
  }
}
