import type { PlanItem, TeamMember, ProposalItem, ProposalAllocation } from '../types'
import { appsMatch, hasValidApplication } from './apps'

/**
 * Strict assignment proposal engine with application matching
 * Only assigns items to team members whose application exactly matches the item's application
 */
export class ProposalEngine {
  private items: PlanItem[]
  private team: TeamMember[]
  private memberCapacities: Map<string, number>

  constructor(items: PlanItem[], team: TeamMember[], memberCapacities: Map<string, number>) {
    this.items = items
    this.team = team
    this.memberCapacities = new Map(memberCapacities)
  }

  /**
   * Generate assignment proposals using strict application matching
   */
  generateProposals(): ProposalItem[] {
    // Handle empty cases
    if (this.items.length === 0) {
      return []
    }

    const proposals: ProposalItem[] = []
    const remainingCapacity = new Map(this.memberCapacities)

    // Process each item individually
    for (const item of this.items) {
      const proposal = this.assignItem(item, remainingCapacity)
      proposals.push(proposal)
    }

    return proposals
  }

  /**
   * Assign a single item to team members with strict application matching
   */
  private assignItem(item: PlanItem, remainingCapacity: Map<string, number>): ProposalItem {
    const adjustedDays = item.adjustedDays || 0
    const allocations: ProposalAllocation[] = []
    let remainingDays = adjustedDays

    // Check if item has valid application
    if (!hasValidApplication(item.application)) {
      return {
        itemId: item.id,
        itemKey: item.key,
        itemTitle: item.title,
        application: item.application,
        adjustedDays,
        allocations: [],
        unassignedDays: adjustedDays,
        status: 'unassigned',
      }
    }

    // Find team members whose application matches the item's application
    const candidates = this.team.filter(member => 
      appsMatch(member.application, item.application) && 
      (remainingCapacity.get(member.id) || 0) > 0
    )

    // If no matching members, mark as unassigned
    if (candidates.length === 0) {
      return {
        itemId: item.id,
        itemKey: item.key,
        itemTitle: item.title,
        application: item.application,
        adjustedDays,
        allocations: [],
        unassignedDays: adjustedDays,
        status: 'unassigned',
      }
    }

    // Sort candidates by remaining capacity DESC
    const sortedCandidates = [...candidates].sort((a, b) => 
      (remainingCapacity.get(b.id) || 0) - (remainingCapacity.get(a.id) || 0)
    )

    // Assign days to matching members
    for (const member of sortedCandidates) {
      if (remainingDays <= 0) break

      const memberCapacity = remainingCapacity.get(member.id) || 0
      if (memberCapacity <= 0) continue

      const daysToAssign = Math.min(remainingDays, memberCapacity)
      
      allocations.push({
        memberId: member.id,
        name: member.name,
        daysAssigned: daysToAssign,
      })

      // Update remaining capacity
      const newCapacity = memberCapacity - daysToAssign
      remainingCapacity.set(member.id, newCapacity)
      remainingDays -= daysToAssign
    }

    const unassignedDays = Math.max(0, remainingDays)
    const status = unassignedDays === 0 
      ? 'fully-assigned' 
      : allocations.length === 0 
        ? 'unassigned' 
        : 'partially-assigned'

    return {
      itemId: item.id,
      itemKey: item.key,
      itemTitle: item.title,
      application: item.application,
      adjustedDays,
      allocations,
      unassignedDays,
      status,
    }
  }
}

/**
 * Generate assignment proposals for plan items with strict application matching
 */
export function generateAssignmentProposals(
  items: PlanItem[],
  team: TeamMember[],
  memberCapacities: Map<string, number>
): ProposalItem[] {
  const engine = new ProposalEngine(items, team, memberCapacities)
  return engine.generateProposals()
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use generateAssignmentProposals instead
 */
export function generateLegacyProposals(
  items: PlanItem[],
  team: TeamMember[],
  memberCapacities: Map<string, number>
): any[] {
  const proposals = generateAssignmentProposals(items, team, memberCapacities)
  
  // Convert to legacy format
  return proposals.map(proposal => ({
    itemId: proposal.itemId,
    itemTitle: proposal.itemTitle,
    application: proposal.application || '',
    adjustedDays: proposal.adjustedDays,
    allocations: proposal.allocations,
    isFullyAssigned: proposal.status === 'fully-assigned',
    remainingDays: proposal.unassignedDays || 0,
  }))
}
