import { useState, useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { usePlanSummary } from '../hooks/usePlanSummary'
import { useProposal } from '../hooks/useProposal'
import { hasValidApplication } from '../lib/apps'
import JiraSync from '../components/jira/JiraSync'
import PlanGridToolbar from '../components/plan/PlanGridToolbar'
import PlanRecordGrid from '../components/plan/PlanRecordGrid'
import type { PageProps, PlanItem } from '../types'

const PlanPage = ({ className = '' }: PageProps) => {
  const { getCurrentQuarterItems, addPlanItem, updatePlanItem, removePlanItem } = useAppStore()
  const items = getCurrentQuarterItems()
  const planSummary = usePlanSummary()
  const proposal = useProposal()
  const [bulkImportText, setBulkImportText] = useState('')
  const [showBulkImportDialog, setShowBulkImportDialog] = useState(false)
  const [showJiraSync, setShowJiraSync] = useState(false)
  const [showAddItemForm, setShowAddItemForm] = useState(false)
  const [newItem, setNewItem] = useState({
    title: '',
    key: '',
    type: 'Feature' as 'Feature' | 'Story',
    application: '',
    label: '',
    notes: '',
    baseDays: 1,
    certainty: 'Mid' as 'Low' | 'Mid' | 'High',
  })

  // Grid state
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState({
    application: '',
    type: 'all' as 'Feature' | 'Story' | 'all',
    certainty: 'all' as 'Low' | 'Mid' | 'High' | 'all',
    label: '',
  })

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter)
  }
  const [sort, setSort] = useState({
    by: 'title' as 'title' | 'application' | 'adjusted' | 'base' | 'certainty',
    dir: 'asc' as 'asc' | 'desc',
  })

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items

    // Search filter
    if (query) {
      const searchLower = query.toLowerCase()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.key?.toLowerCase().includes(searchLower) ||
        item.notes?.toLowerCase().includes(searchLower)
      )
    }

    // Type filter
    if (filter.type !== 'all') {
      filtered = filtered.filter(item => item.type === filter.type)
    }

    // Certainty filter
    if (filter.certainty !== 'all') {
      filtered = filtered.filter(item => item.certainty === filter.certainty)
    }

    // Application filter
    if (filter.application) {
      const appLower = filter.application.toLowerCase()
      filtered = filtered.filter(item =>
        item.application?.toLowerCase().includes(appLower)
      )
    }

    // Label filter
    if (filter.label) {
      const labelLower = filter.label.toLowerCase()
      filtered = filtered.filter(item =>
        item.label?.toLowerCase().includes(labelLower)
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sort.by) {
        case 'title':
          aValue = a.title
          bValue = b.title
          break
        case 'application':
          aValue = a.application || ''
          bValue = b.application || ''
          break
        case 'adjusted':
          aValue = a.adjustedDays || 0
          bValue = b.adjustedDays || 0
          break
        case 'base':
          aValue = a.baseDays || 0
          bValue = b.baseDays || 0
          break
        case 'certainty':
          const certaintyOrder = { High: 3, Mid: 2, Low: 1 }
          aValue = certaintyOrder[a.certainty as keyof typeof certaintyOrder] || 0
          bValue = certaintyOrder[b.certainty as keyof typeof certaintyOrder] || 0
          break
        default:
          aValue = a.title
          bValue = b.title
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const result = aValue.localeCompare(bValue)
        return sort.dir === 'asc' ? result : -result
      }

      const result = (aValue as number) - (bValue as number)
      return sort.dir === 'asc' ? result : -result
    })

    return filtered
  }, [items, query, filter, sort])

  const handleAddItem = () => {
    setShowAddItemForm(true)
    setNewItem({
      title: '',
      key: '',
      type: 'Feature',
      application: '',
      label: '',
      notes: '',
      baseDays: 1,
      certainty: 'Mid',
    })
  }

  const handleSaveNewItem = () => {
    if (newItem.title.trim()) {
      addPlanItem({
        title: newItem.title.trim(),
        key: newItem.key || undefined,
        type: newItem.type,
        application: newItem.application || undefined,
        label: newItem.label || undefined,
        notes: newItem.notes || undefined,
        baseDays: newItem.baseDays,
        certainty: newItem.certainty,
      })
      setShowAddItemForm(false)
    }
  }

  const handleCancelNewItem = () => {
    setShowAddItemForm(false)
    setNewItem({
      title: '',
      key: '',
      type: 'Feature',
      application: '',
      label: '',
      notes: '',
      baseDays: 1,
      certainty: 'Mid',
    })
  }

  const handleBulkImport = () => {
    const lines = bulkImportText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    lines.forEach(line => {
      const parts = line.split(',').map(part => part.trim())
      if (parts.length >= 3) {
        const [key, title, type, label, application] = parts
        addPlanItem({
          ...(key && { key }),
          title: title || '',
          type: (type as 'Feature' | 'Story') || 'Feature',
          ...(label && { label }),
          ...(application && { application }),
          baseDays: 1,
          certainty: 'Mid',
        })
      }
    })

    setBulkImportText('')
  }

  const handleGenerateProposals = async () => {
    await proposal.generateProposals()
    // Simple notification - in a real app you'd use a proper toast library
    alert('Proposal updated! Check the Team page to see assignments.')
  }

  const handleDuplicateItem = (id: string) => {
    const item = items.find(i => i.id === id)
    if (item) {
      addPlanItem({
        ...item,
        title: `${item.title} (Copy)`,
        key: item.key ? `${item.key}-copy` : undefined,
      })
    }
  }

  const handleEditItem = (partial: Partial<PlanItem> & { id: string }) => {
    const { id, ...updates } = partial
    updatePlanItem(id, updates)
  }

  return (
    <div className={`p-6 ${className}`}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
        {/* Plan Items Section */}
        <div className="space-y-6">
          {/* Plan Items Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Plan Items</h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowJiraSync(!showJiraSync)}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              >
                {showJiraSync ? 'Hide Jira Sync' : 'Jira Sync'}
              </button>
              <button
                onClick={() => setShowBulkImportDialog(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Bulk Import
              </button>
            </div>
          </div>

          {/* Jira Sync Section */}
          {showJiraSync && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <JiraSync onSyncComplete={(result) => {
                console.log('Sync completed:', result)
                setShowJiraSync(false)
              }} />
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Plan Summary */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Plan Summary</h3>
              
              {/* Total Adjusted Effort */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Total Adjusted Effort</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {planSummary.totalAdjustedEffort.toFixed(1)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  {planSummary.totalItems} items
                </div>
                
                {/* Visual Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((planSummary.totalAdjustedEffort / 100) * 100, 100)}%` 
                    }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {planSummary.totalAdjustedEffort > 100 ? 'Over capacity' : 'Within capacity'}
                </div>
              </div>

              {/* By Application */}
              <div>
                <h4 className="mb-3 text-sm font-medium text-gray-700">By Application</h4>
                {planSummary.byApplication.length > 0 ? (
                  <div className="space-y-2">
                    {planSummary.byApplication.map((app) => {
                      const percentage = planSummary.totalAdjustedEffort > 0 
                        ? (app.totalAdjustedDays / planSummary.totalAdjustedEffort) * 100 
                        : 0
                      
                      return (
                        <div key={app.application} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{app.application}</div>
                            <div className="text-xs text-gray-500">{app.itemCount} items</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-700">
                              {app.totalAdjustedDays.toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">No items with applications</div>
                )}
              </div>
            </div>

            {/* Assignment Summary */}
            {proposal.hasProposals && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-medium text-gray-900">Assignment Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Assignment Efficiency</span>
                    <span className={`text-sm font-semibold ${
                      proposal.assignmentEfficiency >= 90 ? 'text-green-600' : 
                      proposal.assignmentEfficiency >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {proposal.assignmentEfficiency.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Assigned</span>
                    <span className="text-sm font-semibold text-gray-700">
                      {proposal.totalAssignedDays.toFixed(1)} / {proposal.totalAdjustedDays.toFixed(1)} days
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Items Assigned</span>
                    <span className="text-sm font-semibold text-gray-700">
                      {proposal.proposals.filter(p => p.allocations.length > 0).length} / {proposal.proposals.length}
                    </span>
                  </div>
                  
                  {proposal.hasUnassignedItems && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                      <div className="flex items-center">
                        <span className="text-orange-600 text-sm font-medium">⚠️ Some items could not be fully assigned</span>
                      </div>
                      <div className="text-xs text-orange-600 mt-1">
                        Consider adjusting team capacity or reducing item scope
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Toolbar */}
          <PlanGridToolbar
            total={filteredAndSortedItems.length}
            query={query}
            onQuery={setQuery}
            filter={filter}
            onFilter={handleFilterChange}
            sort={sort}
            onSort={setSort}
            onAddItem={handleAddItem}
          />

          {/* Add Item Form */}
          {showAddItemForm && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Plan Item</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="Enter item title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jira Key</label>
                  <input
                    type="text"
                    value={newItem.key}
                    onChange={(e) => setNewItem({ ...newItem, key: e.target.value })}
                    placeholder="e.g., PROJ-123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newItem.type}
                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value as 'Feature' | 'Story' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Feature">Feature</option>
                    <option value="Story">Story</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application</label>
                  <input
                    type="text"
                    value={newItem.application}
                    onChange={(e) => setNewItem({ ...newItem, application: e.target.value })}
                    placeholder="e.g., Web App, Mobile"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                  <input
                    type="text"
                    value={newItem.label}
                    onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                    placeholder="e.g., epic-1, sprint-1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={newItem.notes}
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                    placeholder="Additional details..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Days</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={newItem.baseDays}
                    onChange={(e) => setNewItem({ ...newItem, baseDays: Math.max(0, parseFloat(e.target.value) || 1) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certainty</label>
                  <select
                    value={newItem.certainty}
                    onChange={(e) => setNewItem({ ...newItem, certainty: e.target.value as 'Low' | 'Mid' | 'High' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="High">High</option>
                    <option value="Mid">Mid</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCancelNewItem}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewItem}
                  disabled={!newItem.title.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Item
                </button>
              </div>
            </div>
          )}

          {/* Grid */}
          <PlanRecordGrid
            items={filteredAndSortedItems}
            onEdit={handleEditItem}
            onDelete={removePlanItem}
            onDuplicate={handleDuplicateItem}
          />

          {/* Propose Plan Actions */}
          <div className="flex justify-center space-x-3 pt-6">
            <button
              onClick={handleGenerateProposals}
              disabled={proposal.isGenerating || items.length === 0}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {proposal.isGenerating ? 'Generating...' : 'Propose Plan'}
            </button>
            {proposal.hasProposals && (
              <button
                onClick={proposal.clearProposals}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

            {/* Assignment Proposals */}
            {proposal.hasProposals && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Assignment Proposals</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Efficiency: {proposal.assignmentEfficiency.toFixed(1)}%</span>
                    {proposal.totalUnassignedDays > 0 && (
                      <span className="text-orange-600 font-medium">
                        ⚠️ {proposal.totalUnassignedDays.toFixed(1)}d unassigned
                      </span>
                    )}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Rule: Strict app matching
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {proposal.proposals.map((proposal) => (
                    <div key={proposal.itemId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{proposal.itemTitle}</h4>
                          <p className="text-sm text-gray-600">
                            {proposal.application || 'No Application'} • {proposal.adjustedDays.toFixed(1)} days
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {proposal.status === 'fully-assigned' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Fully assigned
                            </span>
                          )}
                          {proposal.status === 'partially-assigned' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              ⚠️ Partial: {proposal.unassignedDays?.toFixed(1)}d left
                            </span>
                          )}
                          {proposal.status === 'unassigned' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              ❌ No matching team app
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Status hint */}
                      {proposal.status !== 'fully-assigned' && (
                        <div className="mb-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                          {proposal.status === 'unassigned' && !hasValidApplication(proposal.application) && 
                            'Application required for assignment'
                          }
                          {proposal.status === 'unassigned' && hasValidApplication(proposal.application) && 
                            `No team member with application '${proposal.application}'`
                          }
                          {proposal.status === 'partially-assigned' && 
                            `Insufficient capacity for '${proposal.application}' (left: ${proposal.unassignedDays?.toFixed(1)}d)`
                          }
                        </div>
                      )}
                      
                      {proposal.allocations.length > 0 ? (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-700">Assignments:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {proposal.allocations.map((allocation, index) => (
                              <div key={index} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md">
                                <span className="text-sm text-gray-900">{allocation.name}</span>
                                <span className="text-sm font-medium text-gray-700">
                                  {allocation.daysAssigned.toFixed(1)} days
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">No assignments possible</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Bulk Import Dialog */}
        {showBulkImportDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Import</h3>
              <p className="mb-4 text-sm text-gray-600">
                Paste lines with format: Key,Title,Type,Label,Application (one per line)
              </p>
              <div className="space-y-4">
                <textarea
                  value={bulkImportText}
                  onChange={e => setBulkImportText(e.target.value)}
                  placeholder="ISSUE-123,Implement user authentication,Feature,backend,web-app&#10;ISSUE-124,Add login form,Story,frontend,web-app"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowBulkImportDialog(false)
                      setBulkImportText('')
                    }}
                    className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleBulkImport()
                      setShowBulkImportDialog(false)
                    }}
                    disabled={!bulkImportText.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    Import Items
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


export default PlanPage
