import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useCapacity } from './useCapacity'
import type { MemberAssignment, AssignmentOverview, PlanItem } from '../types'

/**
 * Hook to generate assignment overview from proposals
 */
export const useAssignmentOverview = (): AssignmentOverview | null => {
  const { proposal, getCurrentQuarterItems } = useAppStore()
  const items = getCurrentQuarterItems()
  const capacity = useCapacity()

  return useMemo(() => {
    if (!proposal) {
      return null
    }

    // Create a map of plan items for quick lookup
    const itemsMap = new Map<string, PlanItem>()
    items.forEach(item => {
      itemsMap.set(item.id, item)
    })

    // Build member assignments
    const memberAssignments = new Map<string, MemberAssignment>()

    // Initialize all team members
    capacity.perMember.forEach(member => {
      memberAssignments.set(member.memberId, {
        memberId: member.memberId,
        name: member.name,
        application: member.application,
        capacityDays: member.capacityDays,
        allocatedDays: 0,
        remainingDays: member.capacityDays,
        assignments: [],
      })
    })

    // Process proposal allocations
    proposal.items.forEach(proposalItem => {
      proposalItem.allocations.forEach(allocation => {
        const memberAssignment = memberAssignments.get(allocation.memberId)
        if (memberAssignment) {
          memberAssignment.allocatedDays += allocation.daysAssigned
          memberAssignment.assignments.push({
            itemId: proposalItem.itemId,
            itemKey: proposalItem.itemKey,
            itemTitle: proposalItem.itemTitle,
            application: proposalItem.application,
            daysAssigned: allocation.daysAssigned,
            adjustedDays: proposalItem.adjustedDays,
          })
        }
      })
    })

    // Calculate remaining days and convert to array
    const perMember: MemberAssignment[] = Array.from(memberAssignments.values()).map(member => ({
      ...member,
      remainingDays: Math.max(0, member.capacityDays - member.allocatedDays),
    }))

    // Calculate totals
    const totals = perMember.reduce(
      (acc, member) => ({
        capacityDays: acc.capacityDays + member.capacityDays,
        allocatedDays: acc.allocatedDays + member.allocatedDays,
        remainingDays: acc.remainingDays + member.remainingDays,
      }),
      { capacityDays: 0, allocatedDays: 0, remainingDays: 0 }
    )

    return {
      generatedAtISO: proposal.generatedAtISO,
      perMember,
      totals,
    }
  }, [proposal, items, capacity.perMember])
}

/**
 * Hook to detect if proposal is stale
 */
export const useProposalStaleness = (): boolean => {
  const { proposal, getCurrentQuarterItems, getCurrentQuarterTeam, getCurrentQuarterHolidays, quarters, currentQuarterId } = useAppStore()
  const items = getCurrentQuarterItems()
  const team = getCurrentQuarterTeam()
  const holidays = getCurrentQuarterHolidays()

  return useMemo(() => {
    if (!proposal) {
      return false
    }

    // Simple staleness detection based on data changes
    // In a real app, you might want more sophisticated change detection
    const proposalTime = new Date(proposal.generatedAtISO).getTime()
    const now = Date.now()
    
    // Consider stale if older than 1 hour (for demo purposes)
    // In practice, you'd check if underlying data has changed
    const isOld = now - proposalTime > 60 * 60 * 1000
    
    return isOld
  }, [proposal, items, team, holidays, quarters, currentQuarterId])
}
