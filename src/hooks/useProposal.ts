import { useState, useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useCapacity } from './useCapacity'
import { generateAssignmentProposals } from '../lib/proposalEngine'

/**
 * Hook to manage assignment proposals
 */
export const useProposal = () => {
  const { items, team, proposal, setProposal, clearProposal } = useAppStore()
  const capacity = useCapacity()
  const [isGenerating, setIsGenerating] = useState(false)

  // Create member capacities map
  const memberCapacities = useMemo(() => {
    const map = new Map<string, number>()
    capacity.perMember.forEach(member => {
      map.set(member.memberId, member.capacityDays)
    })
    return map
  }, [capacity.perMember])

  // Generate proposals
  const generateProposals = async () => {
    setIsGenerating(true)
    
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const newProposals = generateAssignmentProposals(items, team, memberCapacities)
      setProposal({
        generatedAtISO: new Date().toISOString(),
        items: newProposals,
      })
    } catch (error) {
      console.error('Error generating proposals:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Clear proposals
  const clearProposals = () => {
    clearProposal()
  }

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

  return {
    proposals,
    isGenerating,
    hasProposals,
    hasUnassignedItems,
    totalAssignedDays,
    totalAdjustedDays,
    totalUnassignedDays,
    assignmentEfficiency,
    generateProposals,
    clearProposals,
  }
}
