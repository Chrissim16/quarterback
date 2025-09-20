import type { 
  PlanItem, 
  TeamMember, 
  ProposalItem, 
  ProposalAllocation,
  AssignmentStrategy,
  AssignmentMetrics,
  AssignmentHistory,
  ManualOverride
} from '../types'
import { appsMatch, hasValidApplication } from './apps'

/**
 * Enhanced assignment proposal engine with advanced algorithms
 * Supports skill-based matching, workload balancing, dependencies, and manual overrides
 */
export class EnhancedProposalEngine {
  private items: PlanItem[]
  private team: TeamMember[]
  private memberCapacities: Map<string, number>
  private strategy: AssignmentStrategy
  private manualOverrides: ManualOverride[]
  private assignmentHistory: AssignmentHistory[]

  constructor(
    items: PlanItem[], 
    team: TeamMember[], 
    memberCapacities: Map<string, number>,
    strategy: AssignmentStrategy = this.getDefaultStrategy(),
    manualOverrides: ManualOverride[] = [],
    assignmentHistory: AssignmentHistory[] = []
  ) {
    this.items = items
    this.team = team
    this.memberCapacities = new Map(memberCapacities)
    this.strategy = strategy
    this.manualOverrides = manualOverrides
    this.assignmentHistory = assignmentHistory
  }

  /**
   * Generate enhanced assignment proposals using the configured strategy
   */
  generateProposals(): ProposalItem[] {
    if (this.items.length === 0) {
      return []
    }

    // Sort items by priority and dependencies
    const sortedItems = this.sortItemsByPriority()
    const proposals: ProposalItem[] = []
    const remainingCapacity = new Map(this.memberCapacities)
    const memberWorkload = new Map<string, number>()

    // Initialize workload tracking
    this.team.forEach(member => {
      memberWorkload.set(member.id, 0)
    })

    // Process each item
    for (const item of sortedItems) {
      const proposal = this.assignItem(item, remainingCapacity, memberWorkload)
      proposals.push(proposal)
    }

    return proposals
  }

  /**
   * Sort items by priority, dependencies, and deadlines
   */
  private sortItemsByPriority(): PlanItem[] {
    const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 }
    
    return [...this.items].sort((a, b) => {
      // First by priority
      const aPriority = priorityOrder[a.priority || 'Medium']
      const bPriority = priorityOrder[b.priority || 'Medium']
      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }

      // Then by deadline
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      }
      if (a.deadline) return -1
      if (b.deadline) return 1

      // Finally by complexity (simpler items first)
      const complexityOrder = { 'Simple': 1, 'Medium': 2, 'Complex': 3, 'Very Complex': 4 }
      const aComplexity = complexityOrder[a.estimatedComplexity || 'Medium']
      const bComplexity = complexityOrder[b.estimatedComplexity || 'Medium']
      return aComplexity - bComplexity
    })
  }

  /**
   * Assign a single item using the enhanced algorithm
   */
  private assignItem(
    item: PlanItem, 
    remainingCapacity: Map<string, number>,
    memberWorkload: Map<string, number>
  ): ProposalItem {
    const adjustedDays = item.adjustedDays || 0
    const allocations: ProposalAllocation[] = []
    let remainingDays = adjustedDays

    // Check for manual overrides first
    const manualOverride = this.manualOverrides.find(
      override => override.itemId === item.id && override.isActive
    )

    if (manualOverride) {
      const member = this.team.find(m => m.id === manualOverride.memberId)
      if (member && (remainingCapacity.get(member.id) || 0) >= manualOverride.daysAssigned) {
        allocations.push({
          memberId: member.id,
          name: member.name,
          daysAssigned: manualOverride.daysAssigned,
        })
        remainingCapacity.set(member.id, (remainingCapacity.get(member.id) || 0) - manualOverride.daysAssigned)
        remainingDays -= manualOverride.daysAssigned
      }
    }

    // Check dependencies
    const dependencyStatus = this.checkDependencies(item)
    if (dependencyStatus === 'blocked') {
      return this.createProposalItem(item, allocations, remainingDays, 'unassigned', 'Dependencies not met')
    }

    // Find candidates using enhanced matching
    const candidates = this.findCandidates(item, remainingCapacity, memberWorkload)
    
    if (candidates.length === 0) {
      return this.createProposalItem(item, allocations, remainingDays, 'unassigned', 'No suitable candidates found')
    }

    // Assign remaining days to best candidates
    const sortedCandidates = this.rankCandidates(item, candidates, memberWorkload)
    
    for (const candidate of sortedCandidates) {
      if (remainingDays <= 0) break

      const memberCapacity = remainingCapacity.get(candidate.memberId) || 0
      if (memberCapacity <= 0) continue

      const daysToAssign = Math.min(remainingDays, memberCapacity)
      
      allocations.push({
        memberId: candidate.memberId,
        name: candidate.name,
        daysAssigned: daysToAssign,
      })

      // Update capacity and workload
      remainingCapacity.set(candidate.memberId, memberCapacity - daysToAssign)
      memberWorkload.set(candidate.memberId, (memberWorkload.get(candidate.memberId) || 0) + daysToAssign)
      remainingDays -= daysToAssign
    }

    const unassignedDays = Math.max(0, remainingDays)
    const status = unassignedDays === 0 
      ? 'fully-assigned' 
      : allocations.length === 0 
        ? 'unassigned' 
        : 'partially-assigned'

    return this.createProposalItem(item, allocations, unassignedDays, status)
  }

  /**
   * Find suitable candidates for an item
   */
  private findCandidates(
    item: PlanItem, 
    remainingCapacity: Map<string, number>,
    memberWorkload: Map<string, number>
  ): Array<{ memberId: string; name: string; score: number }> {
    const candidates: Array<{ memberId: string; name: string; score: number }> = []

    for (const member of this.team) {
      // Check basic requirements
      if (!this.isMemberEligible(member, item, remainingCapacity, memberWorkload)) {
        continue
      }

      // Calculate compatibility score
      const score = this.calculateCompatibilityScore(member, item, memberWorkload)
      if (score > 0) {
        candidates.push({
          memberId: member.id,
          name: member.name,
          score
        })
      }
    }

    return candidates
  }

  /**
   * Check if a member is eligible for an item
   */
  private isMemberEligible(
    member: TeamMember, 
    item: PlanItem, 
    remainingCapacity: Map<string, number>,
    memberWorkload: Map<string, number>
  ): boolean {
    // Check capacity
    if ((remainingCapacity.get(member.id) || 0) <= 0) {
      return false
    }

    // Check application matching
    if (this.strategy.settings.considerDependencies && !appsMatch(member.application, item.application)) {
      return false
    }

    // Check preferred/avoided assignees
    if (item.avoidAssignees?.includes(member.id)) {
      return false
    }

    // Check max concurrent items
    const currentItems = memberWorkload.get(member.id) || 0
    const maxItems = member.preferences?.maxConcurrentItems || this.strategy.settings.maxConcurrentItems
    if (currentItems >= maxItems) {
      return false
    }

    // Check availability
    if (member.availability?.startDate && new Date(member.availability.startDate) > new Date()) {
      return false
    }
    if (member.availability?.endDate && new Date(member.availability.endDate) < new Date()) {
      return false
    }

    return true
  }

  /**
   * Calculate compatibility score between member and item
   */
  private calculateCompatibilityScore(
    member: TeamMember, 
    item: PlanItem, 
    memberWorkload: Map<string, number>
  ): number {
    let score = 0

    // Skill matching (40% weight)
    const skillMatch = this.calculateSkillMatch(member, item)
    score += skillMatch * this.strategy.weights.skillMatch

    // Workload balance (30% weight)
    const workloadBalance = this.calculateWorkloadBalance(member, memberWorkload)
    score += workloadBalance * this.strategy.weights.workloadBalance

    // Priority alignment (20% weight)
    const priorityScore = this.calculatePriorityScore(member, item)
    score += priorityScore * this.strategy.weights.priority

    // Deadline consideration (10% weight)
    const deadlineScore = this.calculateDeadlineScore(member, item)
    score += deadlineScore * this.strategy.weights.deadline

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Calculate skill match percentage
   */
  private calculateSkillMatch(member: TeamMember, item: PlanItem): number {
    if (!item.requiredSkills || item.requiredSkills.length === 0) {
      return 100 // No skills required
    }

    if (!member.skills || member.skills.length === 0) {
      return 0 // Member has no skills
    }

    const memberSkills = new Set(member.skills.map(s => s.toLowerCase()))
    const requiredSkills = item.requiredSkills.map(s => s.toLowerCase())
    
    const matchedSkills = requiredSkills.filter(skill => memberSkills.has(skill))
    return (matchedSkills.length / requiredSkills.length) * 100
  }

  /**
   * Calculate workload balance score
   */
  private calculateWorkloadBalance(member: TeamMember, memberWorkload: Map<string, number>): number {
    const currentWorkload = memberWorkload.get(member.id) || 0
    const capacity = this.memberCapacities.get(member.id) || 0
    
    if (capacity === 0) return 0

    const utilization = currentWorkload / capacity
    // Prefer members with lower utilization (better balance)
    return Math.max(0, 100 - (utilization * 100))
  }

  /**
   * Calculate priority alignment score
   */
  private calculatePriorityScore(member: TeamMember, item: PlanItem): number {
    // Check if member prefers this type of work
    if (member.preferences?.preferredItemTypes?.includes(item.type)) {
      return 100
    }
    if (member.preferences?.avoidItemTypes?.includes(item.type)) {
      return 0
    }
    return 50 // Neutral
  }

  /**
   * Calculate deadline score
   */
  private calculateDeadlineScore(member: TeamMember, item: PlanItem): number {
    if (!item.deadline) return 50 // No deadline

    const deadline = new Date(item.deadline)
    const now = new Date()
    const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    // Prefer members who can meet the deadline
    const estimatedDays = item.adjustedDays || 0
    const memberCapacity = this.memberCapacities.get(member.id) || 0
    
    if (memberCapacity >= estimatedDays && daysUntilDeadline >= estimatedDays) {
      return 100
    }
    
    return Math.max(0, 100 - (estimatedDays - daysUntilDeadline) * 10)
  }

  /**
   * Rank candidates by their compatibility scores
   */
  private rankCandidates(
    item: PlanItem, 
    candidates: Array<{ memberId: string; name: string; score: number }>,
    memberWorkload: Map<string, number>
  ): Array<{ memberId: string; name: string; score: number }> {
    return candidates.sort((a, b) => {
      // First by score (higher is better)
      if (a.score !== b.score) {
        return b.score - a.score
      }
      
      // Then by current workload (lower is better for balance)
      const aWorkload = memberWorkload.get(a.memberId) || 0
      const bWorkload = memberWorkload.get(b.memberId) || 0
      return aWorkload - bWorkload
    })
  }

  /**
   * Check if item dependencies are met
   */
  private checkDependencies(item: PlanItem): 'blocked' | 'ready' | 'in-progress' {
    if (!item.dependencies || item.dependencies.length === 0) {
      return 'ready'
    }

    // This is a simplified check - in a real implementation,
    // you'd check the actual status of dependent items
    return 'ready'
  }

  /**
   * Create a proposal item with enhanced metadata
   */
  private createProposalItem(
    item: PlanItem, 
    allocations: ProposalAllocation[], 
    unassignedDays: number, 
    status: 'fully-assigned' | 'partially-assigned' | 'unassigned',
    reason?: string
  ): ProposalItem {
    const proposal: ProposalItem = {
      itemId: item.id,
      itemKey: item.key,
      itemTitle: item.title,
      application: item.application,
      adjustedDays: item.adjustedDays || 0,
      allocations,
      unassignedDays,
      status,
      assignmentReason: reason,
      dependencyStatus: this.checkDependencies(item),
      confidence: this.calculateConfidence(item, allocations),
    }

    // Calculate skill match for the assignment
    if (allocations.length > 0) {
      const member = this.team.find(m => m.id === allocations[0].memberId)
      if (member) {
        proposal.skillMatch = this.calculateSkillMatch(member, item)
      }
    }

    return proposal
  }

  /**
   * Calculate assignment confidence
   */
  private calculateConfidence(item: PlanItem, allocations: ProposalAllocation[]): 'Low' | 'Medium' | 'High' {
    if (allocations.length === 0) return 'Low'
    
    const totalAssigned = allocations.reduce((sum, alloc) => sum + alloc.daysAssigned, 0)
    const requiredDays = item.adjustedDays || 0
    
    if (totalAssigned >= requiredDays * 0.9) return 'High'
    if (totalAssigned >= requiredDays * 0.5) return 'Medium'
    return 'Low'
  }

  /**
   * Get default assignment strategy
   */
  private getDefaultStrategy(): AssignmentStrategy {
    return {
      name: 'Balanced Assignment',
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

  /**
   * Calculate assignment metrics
   */
  calculateMetrics(proposals: ProposalItem[]): AssignmentMetrics {
    const totalItems = proposals.length
    const fullyAssigned = proposals.filter(p => p.status === 'fully-assigned').length
    const partiallyAssigned = proposals.filter(p => p.status === 'partially-assigned').length
    const unassigned = proposals.filter(p => p.status === 'unassigned').length
    
    const averageSkillMatch = proposals.reduce((sum, p) => sum + (p.skillMatch || 0), 0) / totalItems
    
    // Calculate workload variance
    const memberWorkloads = Array.from(this.memberCapacities.keys()).map(memberId => {
      const capacity = this.memberCapacities.get(memberId) || 0
      const allocated = proposals.reduce((sum, p) => 
        sum + p.allocations.reduce((allocSum, alloc) => 
          alloc.memberId === memberId ? allocSum + alloc.daysAssigned : allocSum, 0
        ), 0
      )
      return { capacity, allocated, utilization: capacity > 0 ? allocated / capacity : 0 }
    })
    
    const avgUtilization = memberWorkloads.reduce((sum, m) => sum + m.utilization, 0) / memberWorkloads.length
    const workloadVariance = memberWorkloads.reduce((sum, m) => sum + Math.pow(m.utilization - avgUtilization, 2), 0) / memberWorkloads.length
    
    const dependencyBlocked = proposals.filter(p => p.dependencyStatus === 'blocked').length
    const deadlineAtRisk = proposals.filter(p => p.confidence === 'Low').length
    const efficiency = totalItems > 0 ? (fullyAssigned / totalItems) * 100 : 100

    return {
      totalItems,
      fullyAssigned,
      partiallyAssigned,
      unassigned,
      averageSkillMatch,
      workloadVariance,
      dependencyBlocked,
      deadlineAtRisk,
      efficiency
    }
  }
}

/**
 * Generate enhanced assignment proposals
 */
export function generateEnhancedProposals(
  items: PlanItem[],
  team: TeamMember[],
  memberCapacities: Map<string, number>,
  strategy?: AssignmentStrategy,
  manualOverrides?: ManualOverride[],
  assignmentHistory?: AssignmentHistory[]
): ProposalItem[] {
  const engine = new EnhancedProposalEngine(
    items, 
    team, 
    memberCapacities, 
    strategy, 
    manualOverrides, 
    assignmentHistory
  )
  return engine.generateProposals()
}

/**
 * Calculate assignment metrics
 */
export function calculateAssignmentMetrics(
  items: PlanItem[],
  team: TeamMember[],
  memberCapacities: Map<string, number>,
  proposals: ProposalItem[]
): AssignmentMetrics {
  const engine = new EnhancedProposalEngine(items, team, memberCapacities)
  return engine.calculateMetrics(proposals)
}
