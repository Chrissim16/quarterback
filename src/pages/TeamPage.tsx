import React, { useState, useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useCapacity } from '../hooks/useCapacity'
import { useAssignmentOverview, useProposalStaleness } from '../hooks/useAssignmentOverview'
import { useProposal } from '../hooks/useProposal'
import { formatCountryDisplay } from '../lib/countries'
import { hasValidApplication } from '../lib/apps'
import type { TeamMember, ISO2 } from '../types'

const TeamPage = () => {
  const { getCurrentQuarterTeam, settings, addTeamMember, updateTeamMember, removeTeamMember } = useAppStore()
  const team = getCurrentQuarterTeam()
  const capacity = useCapacity()
  const assignmentOverview = useAssignmentOverview()
  const isProposalStale = useProposalStaleness()
  const proposal = useProposal()
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null)
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    name: '',
    country: undefined,
    application: '',
    allocationPct: 100,
    ptoDays: 0,
  })

  // Assignment overview filtering and sorting state
  const [assignmentFilter, setAssignmentFilter] = useState({
    search: '',
    application: '',
    sortBy: 'remaining' as 'remaining' | 'allocated' | 'name',
    sortOrder: 'asc' as 'asc' | 'desc',
  })
  const [expandedAssignmentMemberId, setExpandedAssignmentMemberId] = useState<string | null>(null)
  const [showUnassignedItems, setShowUnassignedItems] = useState(false)

  // Filter and sort assignment overview
  const filteredAssignments = useMemo(() => {
    if (!assignmentOverview) return []

    let filtered = assignmentOverview.perMember

    // Filter by search
    if (assignmentFilter.search) {
      const searchLower = assignmentFilter.search.toLowerCase()
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchLower) ||
        member.assignments.some(assignment =>
          assignment.itemKey?.toLowerCase().includes(searchLower) ||
          assignment.itemTitle.toLowerCase().includes(searchLower)
        )
      )
    }

    // Filter by application
    if (assignmentFilter.application) {
      filtered = filtered.filter(member =>
        member.application === assignmentFilter.application
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: number | string
      let bValue: number | string

      switch (assignmentFilter.sortBy) {
        case 'remaining':
          aValue = a.remainingDays
          bValue = b.remainingDays
          break
        case 'allocated':
          aValue = a.allocatedDays
          bValue = b.allocatedDays
          break
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        default:
          aValue = a.remainingDays
          bValue = b.remainingDays
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return assignmentFilter.sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return assignmentFilter.sortOrder === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    })

    return filtered
  }, [assignmentOverview, assignmentFilter])

  const handleAddMember = async () => {
    if (newMember.name?.trim()) {
      console.log('Adding team member:', newMember.name.trim())
      const success = await addTeamMember({
        name: newMember.name.trim(),
        country: newMember.country,
        application: newMember.application || undefined,
        allocationPct: newMember.allocationPct || 100,
        ptoDays: newMember.ptoDays || 0,
      })
      
      if (success) {
        console.log('Team member added successfully')
        setNewMember({
          name: '',
          country: undefined,
          application: '',
          allocationPct: 100,
          ptoDays: 0,
        })
        setIsAddingMember(false)
      } else {
        console.error('Failed to add team member')
        alert('Failed to add team member. Please check the console for details.')
      }
    }
  }

  const handleFieldChange = async (id: string, field: keyof TeamMember, value: any) => {
    console.log('Updating team member field:', field, 'to', value)
    const success = await updateTeamMember(id, { [field]: value })
    if (!success) {
      console.error('Failed to update team member')
      alert('Failed to update team member. Please check the console for details.')
    }
  }

  const handleDeleteMember = async (id: string) => {
    if (confirm('Are you sure you want to delete this team member?')) {
      console.log('Deleting team member:', id)
      const success = await removeTeamMember(id)
      if (!success) {
        console.error('Failed to delete team member')
        alert('Failed to delete team member. Please check the console for details.')
      }
    }
  }

  const handleLoadSampleData = async () => {
    if (confirm('This will add sample team members. Continue?')) {
      // Add sample team members for testing capacity calculation
      const sampleMembers = [
        {
          name: 'Alice Johnson',
          country: 'US' as ISO2,
          application: 'Frontend',
          allocationPct: 100,
          ptoDays: 5,
        },
        {
          name: 'Bob Smith',
          country: 'DE' as ISO2,
          application: 'Backend',
          allocationPct: 80,
          ptoDays: 10,
        },
        {
          name: 'Carol Davis',
          country: 'NL' as ISO2,
          application: 'DevOps',
          allocationPct: 60,
          ptoDays: 8,
        },
      ]
      
      console.log('Loading sample team members...')
      let successCount = 0
      for (const member of sampleMembers) {
        const success = await addTeamMember(member)
        if (success) successCount++
      }
      console.log(`Sample data loading complete: ${successCount}/${sampleMembers.length} members added successfully`)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRandomColor = (name: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ]
    const index = name.length % colors.length
    return colors[index] || colors[0]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
            <p className="text-gray-600 mt-1">
              Manage your team members and their allocations for the quarter.
            </p>
          </div>
          <div className="flex space-x-3">
            {team.length === 0 && (
              <button
                onClick={handleLoadSampleData}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Load Sample Data
              </button>
            )}
            <button
              onClick={() => setIsAddingMember(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Member
            </button>
          </div>
        </div>
      </div>

      {/* Add Member Form */}
      {isAddingMember && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Team Member</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={newMember.name || ''}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                value={newMember.country || ''}
                onChange={(e) => setNewMember({ ...newMember, country: e.target.value as ISO2 || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Country</option>
                {settings.countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.code} — {country.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application
              </label>
              <input
                type="text"
                value={newMember.application || ''}
                onChange={(e) => setNewMember({ ...newMember, application: e.target.value })}
                placeholder="Web App"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {!hasValidApplication(newMember.application) && (
                <p className="mt-1 text-xs text-orange-600">
                  This member won't receive any allocations (no application)
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allocation %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={newMember.allocationPct || 100}
                onChange={(e) => setNewMember({ ...newMember, allocationPct: parseInt(e.target.value) || 100 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PTO Days
              </label>
              <input
                type="number"
                min="0"
                value={newMember.ptoDays || 0}
                onChange={(e) => setNewMember({ ...newMember, ptoDays: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setIsAddingMember(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMember}
              disabled={!newMember.name?.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Member
            </button>
          </div>
        </div>
      )}

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member) => (
          <div key={member.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getRandomColor(member.name)}`}>
                  {getInitials(member.name)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{member.name}</h3>
                  {member.country && (
                    <p className="text-sm text-gray-500">
                      {formatCountryDisplay(member.country, settings.countries)}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDeleteMember(member.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Application
                </label>
                <input
                  type="text"
                  value={member.application || ''}
                  onChange={(e) => handleFieldChange(member.id, 'application', e.target.value || undefined)}
                  placeholder="Application"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Allocation %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={member.allocationPct || 100}
                    onChange={(e) => handleFieldChange(member.id, 'allocationPct', parseInt(e.target.value) || 100)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    PTO Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={member.ptoDays || 0}
                    onChange={(e) => handleFieldChange(member.id, 'ptoDays', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {team.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first team member.</p>
          <button
            onClick={() => setIsAddingMember(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Team Member
          </button>
        </div>
      )}

      {/* Capacity Summary */}
      {team.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Team Capacity Summary</h3>
            <div className="text-sm text-gray-500">
              Total Working Days: <span className="font-medium">{capacity.totalWorkingDays}</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {capacity.perMember.map((member) => (
                  <React.Fragment key={member.memberId}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.application || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${
                            member.capacityDays > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {member.capacityDays.toFixed(1)}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">days</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => setExpandedMemberId(
                            expandedMemberId === member.memberId ? null : member.memberId
                          )}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <span className="mr-1">
                            {expandedMemberId === member.memberId ? 'Hide' : 'Show'}
                          </span>
                          <svg
                            className={`w-4 h-4 transform transition-transform ${
                              expandedMemberId === member.memberId ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                    {expandedMemberId === member.memberId && (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Working Days:</span>
                              <div className="text-gray-600">{member.details.workingDays}</div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Allocation:</span>
                              <div className="text-gray-600">{member.details.allocationPct}%</div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">PTO Days:</span>
                              <div className="text-gray-600">{member.details.ptoDays}</div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Public Holidays:</span>
                              <div className="text-gray-600">{member.details.publicHolidayDays}</div>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Calculation:</span> 
                              {' '}({member.details.workingDays} × {member.details.allocationPct}%) - {member.details.ptoDays} - {member.details.publicHolidayDays} = {member.capacityDays.toFixed(1)} days
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={2} className="px-6 py-3 text-sm font-medium text-gray-900">
                    Total Team Capacity
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <span className="text-green-600">
                        {capacity.perMember.reduce((sum, member) => sum + member.capacityDays, 0).toFixed(1)}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">days</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {capacity.perMember.length} members
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Assignment Overview */}
      {assignmentOverview && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Assignments (from latest Proposal)</h3>
            <div className="flex items-center space-x-3">
              {isProposalStale ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  ⚠️ Stale — re-run Propose Plan
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Up to date · {new Date(assignmentOverview.generatedAtISO).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="mb-4 space-y-3">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-64">
                <input
                  type="text"
                  placeholder="Search members or items..."
                  value={assignmentFilter.search}
                  onChange={(e) => setAssignmentFilter(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="min-w-48">
                <select
                  value={assignmentFilter.application}
                  onChange={(e) => setAssignmentFilter(prev => ({ ...prev, application: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Applications</option>
                  {Array.from(new Set(assignmentOverview.perMember.map(m => m.application).filter(Boolean))).map(app => (
                    <option key={app} value={app}>{app}</option>
                  ))}
                </select>
              </div>
              <div className="min-w-32">
                <select
                  value={`${assignmentFilter.sortBy}-${assignmentFilter.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-') as [typeof assignmentFilter.sortBy, typeof assignmentFilter.sortOrder]
                    setAssignmentFilter(prev => ({ ...prev, sortBy, sortOrder }))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="remaining-asc">Remaining ↑</option>
                  <option value="remaining-desc">Remaining ↓</option>
                  <option value="allocated-asc">Allocated ↑</option>
                  <option value="allocated-desc">Allocated ↓</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                </select>
              </div>
            </div>
          </div>

          {/* Unassigned Effort Banner */}
          {proposal.totalUnassignedDays > 0 && (
            <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-orange-800">
                    Unassigned effort: {proposal.totalUnassignedDays.toFixed(1)}d across{' '}
                    {proposal.proposals.filter(p => p.status !== 'fully-assigned').length} items
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    Items without matching team members or insufficient capacity
                  </div>
                </div>
                <button
                  onClick={() => setShowUnassignedItems(!showUnassignedItems)}
                  className="px-3 py-1 text-sm font-medium text-orange-700 bg-orange-100 rounded-md hover:bg-orange-200 transition-colors"
                >
                  {showUnassignedItems ? 'Hide' : 'View'} unassigned items
                </button>
              </div>
              
              {/* Unassigned Items List */}
              {showUnassignedItems && (
                <div className="mt-3 space-y-2">
                  {proposal.proposals
                    .filter(p => p.status !== 'fully-assigned')
                    .map((item) => (
                      <div key={item.itemId} className="flex justify-between items-center p-2 bg-white rounded border">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.itemKey && `${item.itemKey} · `}{item.itemTitle}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.application || 'No Application'} • {item.adjustedDays.toFixed(1)}d total
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-orange-700">
                            {item.unassignedDays?.toFixed(1)}d unassigned
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.status === 'unassigned' ? 'No matching team' : 'Insufficient capacity'}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Assignment Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    App
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allocated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignments
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map((member) => (
                  <React.Fragment key={member.memberId}>
                    <tr 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandedAssignmentMemberId(
                        expandedAssignmentMemberId === member.memberId ? null : member.memberId
                      )}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.application || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {member.capacityDays.toFixed(1)}d
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {member.allocatedDays.toFixed(1)}d
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${
                            member.remainingDays < 0 ? 'text-red-600' :
                            member.remainingDays < 1 ? 'text-red-600' :
                            member.remainingDays <= 5 ? 'text-yellow-600' : 'text-gray-700'
                          }`}>
                            {member.remainingDays < 1 ? 'No Capacity' : `${member.remainingDays.toFixed(1)}d`}
                          </span>
                          {member.remainingDays < 0 && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Over-allocated
                            </span>
                          )}
                          {member.remainingDays >= 0 && member.remainingDays < 1 && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              No Capacity
                            </span>
                          )}
                          {member.remainingDays >= 1 && member.remainingDays <= 5 && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Tight
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {member.assignments.slice(0, 3).map((assignment, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs shadow-sm bg-gray-50 text-gray-700"
                              title={`${assignment.itemTitle} — ${assignment.application || 'No Application'}`}
                            >
                              {assignment.itemKey || assignment.itemTitle} ({assignment.daysAssigned.toFixed(1)}d)
                            </span>
                          ))}
                          {member.assignments.length > 3 && (
                            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs shadow-sm bg-gray-100 text-gray-600">
                              +{member.assignments.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedAssignmentMemberId === member.memberId && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700">All Assignments</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {member.assignments.map((assignment, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {assignment.itemKey && `${assignment.itemKey} · `}{assignment.itemTitle}
                                    </div>
                                    <div className="text-xs text-gray-500">{assignment.application || 'No Application'}</div>
                                  </div>
                                  <div className="text-sm text-gray-700">
                                    {assignment.daysAssigned.toFixed(1)} / {assignment.adjustedDays.toFixed(1)}d
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={2} className="px-6 py-3 text-sm font-medium text-gray-900">
                    Total
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    {assignmentOverview.totals.capacityDays.toFixed(1)}d
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    {assignmentOverview.totals.allocatedDays.toFixed(1)}d
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    {assignmentOverview.totals.remainingDays.toFixed(1)}d
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {assignmentOverview.perMember.reduce((sum, m) => sum + m.assignments.length, 0)} assignments
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamPage